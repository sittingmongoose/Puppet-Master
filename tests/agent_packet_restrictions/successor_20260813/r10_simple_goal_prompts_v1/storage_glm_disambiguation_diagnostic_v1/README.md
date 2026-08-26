# Storage GLM disambiguation diagnostic v1

This is a fresh, zero-credit, three-gate OMP diagnostic. It separates current
Ox route availability from explicit-GLM transport and then tests Muse only
after both Ox controls independently pass.

Frozen order:

1. `opencode-go/ox-alpha-free` / `max`, native/default V7 transport.
2. `opencode-go/ox-alpha-free` / `max`, exact 21-byte explicit-GLM overlay.
3. `opencode-go/muse-spark-1.2-contributor` / `xhigh`, the same GLM adapter.

Every row receives the unchanged 3,036-byte Storage prompt through one native
`/goal` submission. The V7 scorer, full transport/evidence verifier, isolated
Linux profile, both advisor-off controls, no-ordinary-tools rule, 3,600-second
budget, and normal-exit requirement remain unchanged. Rows are one-use,
all-count, exact-next, and permanently fail-stop. No retry, replacement,
best-of, retro-credit, matrix credit, or automatic successor authority exists.

The native gate uses the unmodified V7 session parser and no `--config` token.
The GLM gates temporarily install the frozen closed projection and exact
`tools.format: glm` overlay. Framing is never scored or treated as lifecycle.

All Windows OMP and Windows Terminal processes/windows are foreign. This
package may use only its isolated Linux profile and fresh planned `/tmp` paths.

Zero-subject commands:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py verify-prefix
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
```

Subject execution is separately authorized, one ordinal at a time:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py run 1 --max-seconds 3600
```
