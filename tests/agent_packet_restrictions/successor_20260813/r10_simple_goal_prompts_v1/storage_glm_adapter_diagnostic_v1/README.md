# Storage owned-GLM adapter diagnostic v1

This is a fresh, two-row, zero-credit OMP diagnostic. It is not a Storage matrix and cannot contribute matrix, qualification, production, retry, replacement, or retroactive credit.

The fixed order is:

1. `omp_ox_alpha_free_max` — free Ox/max control.
2. `omp_muse_spark_xhigh` — Muse/xhigh disconfirming row, mechanically admitted only after row 1 independently verifies `PASS`.

Both rows reuse the exact 3,036-byte V7 OMP prompt and scorer, isolated Linux OMP 18.0.4 profile, advisor-off controls, one native `/goal` submission, no ordinary tools, a 3,600-second budget, and clean normal exit. The only transport change is the frozen 21-byte `tools.format: glm` overlay. The only verification adapter is the frozen closed V3 projection: one canonical GLM `goal({"op":"complete"})` raw block may have no following block or one unscored ASCII-whitespace/sole-`<observation>` framing block. All native Goal start/call/result/complete, exact final, scorer, evidence, and exit checks remain V7-owned.

The source package contains exactly four files. The overlay and projection are imported byte-for-byte from `ox_owned_glm_reliability_v3`; no V7 runner, parser, scorer, or verifier body is copied.

Zero-subject checks:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -B -O controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B -O selftest.py
```

After all four files are committed at one HEAD present at both configured remotes, the only admitted subject commands are, sequentially:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py run 1 --max-seconds 3600
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py run 2 --max-seconds 3600
```

Row 2 must not run unless `verify-prefix` reports the exact row-1 PASS prefix. Any consumed failure permanently stops the diagnostic. Every Windows OMP and Windows Terminal process/window is foreign: do not inspect, focus, inject, reuse, signal, close, or clean it up.
