# Storage MiMo Goal-Completion Diagnostic V8

This is a self-contained, one-row fork of the committed Storage Normalized
Matrix V6 harness. It retains the V6 runner, profile isolation, exact argv and
configuration checks, preflight/Popen custody, semantic normalizer, raw/session/
TUI custody, frozen pipeline, formal-chain replay, failure terminalization,
evidence-tree closure, one-Ctrl-D normal-exit lifecycle, and post-PASS HOLD.
It does not import or wrap the V6 runtime controller.
The package-local `local_runtime.py` contains the audited V3/MiMo helper
extraction and imports only the complete pinned V7 runtime closure (all 27
manifest files plus the manifest itself); it imports no historical controller
or Codex lane.

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
