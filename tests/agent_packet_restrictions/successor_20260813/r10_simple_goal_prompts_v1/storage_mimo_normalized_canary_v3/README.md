# Storage MiMo Normalized Canary V3

This is one fresh, one-use, zero-credit native OMP Goal canary for exactly
`opencode-zen/mimo-v2.5-free` at `high`. It is a reset under the current active
Goal objective, not a retry or retroactive repair of either consumed MiMo row.

V3 never opens the continuously changing live `Plans/**` tree. Before any row
reservation or route/profile/catalog work, it validates commit
`9a9f3068a01652071933582266244cce726a2dd5`, materializes the complete pinned
`Plans` and `scripts` trees from Git objects into a fresh read-only snapshot,
and temporarily redirects only `pipeline.REPO` while calling the original
unmodified V7 pipeline verifier. Git modes, tree/blob IDs, complete rosters,
bytes, and hashes are checked; symlinks, submodules, missing or extra members,
and tampering fail closed. `pipeline.REPO` is restored on success and error.
The immutable snapshot receipt is bound through preflight, launch, terminal,
and formal verification. The materialization is disposable: it is removed in
the controller `finally`, and later verification rematerializes it from the
pinned Git objects rather than depending on surviving `/tmp` state.

The subject receives the unchanged 3,036-byte V7 `/goal` prompt once, followed
by one standalone carriage return. OMP runs for at most 3,600 seconds in fresh
Linux-only `cwd`, session, profile, HOME, XDG, Claude, and Copilot roots. The
route is native/default: no `--config`, ordinary tools, skills, rules, MCP
servers, or extensions. The existing Windows OMP/Terminal is foreign and must
not be inspected, focused, injected into, signalled, reused, closed, or cleaned.

The route-local profile seed is exactly `config.yml`, `agent.db`, and
`models.db` copied from the approved profile. It deliberately contains no GLM
`models.yml` override. Immediately before Popen, a forced provider-only
`opencode-zen` catalog refresh must prove one free MiMo selector, `high`
thinking support, and `openai-completions`; the raw stdout and stderr are
embedded in `omp_preflight.json`. This metadata check performs no subject/model
inference.

Submission readiness is the visible prompt glyph and exact visible
`MiMo V2.5 Free · high` selection. No persisted JSONL is required before the
prompt write. Persisted session evidence is required after prompt-plus-Enter.
The unmodified V7 structural verifier must then prove native Goal activation,
one canonical `goal({"op":"complete"})` lifecycle, distinct final assistant,
zero ordinary tools, no retry/provider error, and normal exit. Only after that
structure does the local deterministic normalizer scan every bounded assistant
text block, strictly validate all line-shaped `PM_RESULT` candidates, enforce
exact schema/types/values and meaningful list order while treating input object
key order as semantic noise, reject malformed/conflicting candidates, and emit
the frozen oracle's schema-defined canonical object order. Candidate markers
may have surrounding ASCII horizontal whitespace or one-or-more ASCII spaces
or tabs after `PM_RESULT`; their raw line, hash, and location remain preserved.
Inline prose mentions are not candidates.

Raw TUI, transcript, persistent session, structural projection, normalized
projection, launch/preflight/reservation/journal, and terminal hashes remain
authoritative custody. A PASS still grants zero qualification, matrix, or
production credit and only permits a separately authorized next step.

Zero-subject commands:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py verify-prefix
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -B -O selftest.py
```

The eventual one-use command is intentionally not run by preparation or tests:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py run 1 --max-seconds 3600
```

Execution additionally requires an independently reviewed, committed,
dual-pushed candidate whose five owned live files and corrected V2 lineage
receipt exactly match stage-0 and HEAD blobs. Any consumed defect is permanent
and fail-stops the canary. Live canonical Plans remain untouched throughout.
