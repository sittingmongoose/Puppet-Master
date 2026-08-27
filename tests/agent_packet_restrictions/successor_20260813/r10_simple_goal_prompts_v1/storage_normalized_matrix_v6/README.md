# Storage Normalized Matrix V6

Fresh 12-route-by-two-pass, zero-credit-until-24/24 Storage qualification matrix.
It imports the pinned V7 runner, lifecycle parser, row/tree verifiers and pipeline;
the V3 MiMo canary's complete 6,097-file read-only Git snapshot and live-`Plans/**`
read guard; and the pushed `storage_native_matrix_v2`
Codex App lane. It never imports a normalized-matrix V5 controller, a GLM model
override, private HTTP capture, `config/models.yml`, `PI_REQ_DEBUG`, or an
order-sensitive result normalizer.

The frozen route order is MiMo/high, Cursor/default auto, Muse/xhigh,
DeepSeek/max, Gemini/high, the six requested Codex model/effort pairs, then
Qwen/xhigh. Pass 1 must be exact 12/12 PASS before pass 2. All 24 attempt,
nonce, runtime, evidence, and App identities are fresh. A consumed defect stops
the suffix: no retry, replacement, reuse, or retro-credit. Qualification credit
is possible only at unchanged 24/24.

All OMP routes use one generic native/default adapter, exact route-local
selector and effort, both advisor controls off, and one `/goal` prompt. Only
MiMo performs the forced free/current catalog/API gate. Codex uses the native
App Goal lane and one ordinary prompt beginning `Create a goal that`.

The matrix-owned `controller.semantic_normalize` accepts benign object-key
order, JSON whitespace (including bounded multiline objects), surrounding prose,
and candidate location variation. V3 supplies strict JSON, typed equality, and
schema helpers plus historical lineage, not matrix candidate extraction. Schema, types, values,
meaningful list order, duplicate keys, nonfinite values, malformed candidates,
and conflicts remain fail-closed. Cursor alone temporarily disables exactly
V7's two terminal-location `require` calls; every lifecycle, nonempty-final,
schema, value, tool, retry, Goal-completion, and exit check remains installed,
and the two functions are restored in `finally`.

The V3 input snapshot is materialized only from pinned Git objects, verified as
the complete `Plans` and `scripts` trees, read-only, and removed after use. Live
canonical Plans are never opened by the matrix adapter. Detached V3 canary
authority/push custody is verified from pinned Git objects and grants no matrix
authority by itself.

Zero-subject checks:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py verify-prefix
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -O -B selftest.py
```

No provider/App call, Windows interaction, commit, or push is performed by
lint/selftest. After these four files and dependencies are committed and
dual-pushed unchanged, `python3 -B controller.py run <ordinal> --max-seconds
3600` launches only the exact next row. Codex rows then use the emitted atomic
create/wait/read/raw requests with their matching `codex-ingest-*` commands.
