# Muse owned-XML route probe v1

This is a deliberately small, zero-credit compatibility probe after the permanent V7 Muse failure. It changes one runtime invariant only: OMP receives the frozen overlay `tools.format: xml`. The 3,036-byte Storage prompt, exact oracle, V7 scorer and session parser, native `/goal` lifecycle, advisor-off profile, zero ordinary tools, and model/effort selectors remain unchanged.

The probe is fail-stopped and one-use. Free `opencode-go/ox-alpha-free` at `max` runs first. Muse Spark at `xhigh` may launch only after Ox has independently produced a native Goal completion, exact V7 result, and normal exit. Any failure is terminal for this probe; there is no retry, replacement, best-of, second dialect, or qualification credit.

The generic XML format is OMP-owned in-band tool transport. OMP still parses a successful XML invocation into its canonical `goal` tool, executes the native Goal runtime, persists the native Goal result, and must normally exit. Text-only semantic success does not pass.

This probe does not capture raw HTTP request headers or provider credentials. The frozen overlay and exact launch argv are bound in the preflight and launch receipts; the authoritative persisted OMP session must prove whether a canonical Goal call/result actually occurred.

Run only after lint and independent review:

```text
python3 -B probe_runner.py lint
python3 -B probe_runner.py run omp_ox_alpha_free_max --max-seconds 3600
python3 -B probe_runner.py run omp_muse_spark_xhigh --max-seconds 3600
```

The second command is unauthorized unless the first row is a durable PASS. Neither command may be repeated.
