# Storage MiMo Goal-Completion Diagnostic V9

This is a self-contained, one-row fork of the committed Storage Normalized
Matrix V6 harness. It retains the V6 runner, profile isolation, exact argv and
configuration checks, preflight/Popen custody, semantic normalizer, raw/session/
TUI custody, frozen pipeline, formal-chain replay, failure terminalization,
evidence-tree closure, one-Ctrl-D normal-exit lifecycle, and post-PASS HOLD.
It does not import or wrap the V6 runtime controller.
Before `local_runtime.py` or any V7 module imports, package-local stdlib-only
`dependency_bootstrap.py` materializes the exact 28-file V7 closure solely from
commit `c71705e045480f7a73a0d7449d0cf7df048a9bc9` Git blobs into a fixed fresh,
read-only `/tmp` root. Live-tree, archive, worktree, fallback, preloaded-module,
symlink, extra-file, and custody drift paths fail closed.

The sole fresh diagnostic route is `opencode-zen/mimo-v2.5-free` at `high`.
Both advisors are off. It admits one native `/goal` submission, exactly one
provided `goal` completion call with `{"op":"complete"}`, no ordinary tools,
no retry, no suffix, and no qualification credit.

The prompt is exactly derived from the frozen V6 OMP prompt by replacing only
the final carrier/lifecycle paragraphs. It admits semantic `PM_RESULT` JSON:
object-key order, JSON whitespace, surrounding prose, and marker location are
benign. Schema, types, values, list order, duplicate keys, nonfinite values,
malformed or absent candidates, and conflicts remain fail-closed.

The full 6,097-entry `Plans` and `scripts` input is materialized only from pinned
Git objects at `9a9f3068a01652071933582266244cce726a2dd5`. The selected receipt, root,
commit, trees, roster, content roster, and bytes are independently replayed.
Live `Plans/**` reads, default/live roots, partial roots, WorkNodes, Windows
interaction, and any unverified PASS are forbidden.

Zero-subject checks:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py verify-prefix
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -O -B selftest.py
```

No provider call, launch, commit, or push is performed by these checks. Runtime
issuance is intentionally unavailable until all owned files are committed and
dual-pushed unchanged. The sole runtime form is
`python3 -B controller.py run 1 --max-seconds 3600`.
