# PM7 full Settings/dialog gate — 2026-10-12 UTC

Both requested current-candidate full walks **PASS**: normal **2,513 views** and Reduced Motion **2,631 views**, each
with **0 findings, 0 instances, 0 failed views and 0 page errors**, exit 0. Overall **HOLD** remains for setup reliability:
the bounded main setup probe also failed in an owned isolated context. The root cause remains unestablished.
An isolated candidate pass does not clear any failed default or main setup assertion.

Worker: `codex-pm7-dialog-gate`, coordinated by `home-redesign-planner`. Initial HEAD was exactly
`eced2b522722c29931b6460ed05485d3b58ee83a`, with a clean `fix/pm7-settings-dialog-gate-20261012` worktree. Source-owner
main base: `9324862e3456e7a9d3836225cfd972d2e6b0170b`. Code commit: `95fea0976802ad4a0d240a3ff067ba1664518a39`.
This branch stays unlanded for root review; source-owner integration requires explicit approval.

The code/usage delta is two files, **22 insertions and 5 deletions**. `--fresh-context` requires `--cdp`, creates only
its own isolated context inside the admitted browser, and closes it on success, failure or signals. Retaining the
creation promise also covers a signal during context creation. Default CDP retains its existing source path, with
context-mode telemetry added. The session owner still stops the helper. No product source, generated HTML, Plans,
governance, main/shared checkout, landing lock or phase 3 work was changed. No extra agents were started.

The collector, every predicate/threshold/exemption, look setting and confirmation, scope/look catalog, Settings
navigation, traversal, full selection/loop and exit criteria are byte-identical. The bounded inverse projection of
only context ownership, documentation and telemetry additions reconstructs the entire original driver SHA exactly.
Proof: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-settings-dialog-gate-20261012/preservation-proof.json`, SHA-256 `afc6699fcd3101400c2080480edd258920803d34c966a639b099ea42b6464177`.
Patch: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-settings-dialog-gate-20261012/test-tool-delta.patch`, SHA-256 `65aacbf5cca1fbeaf2b83e5897904dcc9073005e1cb50e492bb0bd84b8b0ce62`.

| Input/tool | SHA-256 |
|---|---|
| PM7 / Opus / Home, frozen candidate bytes | `b612df00caa2e2fb13b9b2307a17f283358845b596f33a27a31ba55d40266451` |
| Rail, preserved and not re-walked | `57904010d6d6d14ca192cc45bb7b7e710a40f184c72df50a73df4f78375b541c` |
| Main PM7, bounded setup comparison only | `5f87466ece4cb8167b40a68b4acaa1da3ecb4d5b268a95afae38abddde6522fb` |
| Original pill driver | `a1fc6b95d757d2cdf2b16e982124d0c0e9f116b31bfdea179cf354b506477994` |
| Tested pill driver | `2d2ed65deadf51b2d4ff1e53551cc37b9b77c85100319f14c9b0a56100180041` |
| Functional driver, preserved and not re-run | `f0f9293cc82498e866c1eadac5a8c5eb70b62ca76da102a9bc9bb5e3cc3c2728` |

Each full run enabled `--dialogs`, selected all ten looks and omitted `--quick`, using the existing driver with
`--scopes settings,thememenu,floaters,shell`, `--viewport 1920x1080`, `--cdp <admitted endpoint>` and `--fresh-context`.
Normal ran once, then Reduced Motion ran once with `--reduced`. Each covered all 29 Settings pages per look, the
manager tabs and one-click dialogs selected by the unchanged walker, and ten scans each of theme menu, floaters and
shell. The actual view lists and differing totals are retained; no counts were substituted or normalized.

| Look | Normal views | Reduced Motion views |
|---|---:|---:|
| basic-light | 252 | 264 |
| friendly-light | 250 | 263 |
| glass-dark | 250 | 263 |
| retro-dark | 257 | 263 |
| basic-dark | 251 | 263 |
| friendly-dark | 250 | 263 |
| glass-light | 250 | 263 |
| retro-light | 251 | 263 |
| nier-light | 251 | 263 |
| nier-dark | 251 | 263 |

Both reports name `cdp-isolated` and renderer `ANGLE (NVIDIA Corporation, Quadro P1000/PCIe/SSE2, OpenGL 4.5.0)`.
Normal helper: `43142188a50e`; RM helper: `1e0430a9682f`. Node `v22.22.1`, Chrome `154.0.8037.97`, Playwright Core
`1.64.0`. SSH used `ubuntu-p1000` with `~/.ssh/config.nas1-peers`. The installed `agent-browser` provided normal global
admission and each session's fresh profile, with one owned session at a time. Helper/service/config/ports/caps and
profile setup were not modified. No recording, exclusivity or performance claim.

| Raw result | SHA-256 |
|---|---|
| `full-normal/report.json` | `34ff10e29f1ac8d989957c2c7eea8ecefb925c75a30d5388bcda5fc9c9dd44f7` |
| `full-normal/receipt.json` | `c58f8c6e0ecb07b1e707667583d16a4b1b43698591428abe66e940fc51f220d4` |
| `full-reduced/report.json` | `94462f943642c32d772d5d56121defc4bf9e35e50388265af6c77caacc46f5e6` |
| `full-reduced/receipt.json` | `1eeed3e107716c82ba19dfcd21e1bb6181e7d55189086b3872ee43dbbc2d3b24` |

The bounded setup checks kept the exact `boot` and `setLook` source prefix and added only their setup entry/teardown.
They perform no Settings walk; the full driver also enumerates domains before calling `setLook`. These setup-only
observations are not main full-walk results. Candidate default before and after the flag, main default, and main
isolated each exited **2** at the first look, with the same exact error:

```
FATAL Error: look did not apply: basic-light got {"theme":"basic-dark","nier":null}
```

The unexpected main isolated failure is at **setup / first look `basic-light`**, not a pill/stripe finding; its helper
`06ac1d0c1d84` was stopped and its owned context disposed. Raw `setup-main-isolated/receipt.json` SHA-256
`f7e14d1faed4baf63d7b3203f8fbbfdfb55ba1068f856c1f645088e08e0016fa`. It remains a failure, alongside the original failed
quick runs in the untouched 334-entry bundle. That old manifest remains
`e74bfe1d0a739e88e5b95fe000f83e50ab8b2f22131f139bd6dd7d9cb9d46197`. No source/theme-engine repair, profile hack, skipped
look assertion or relaxed criterion was applied. There were no candidate findings requiring a main comparison.
Functional 80 + 20, other passed quick matrices and a whole main campaign were not repeated.

Actual SIGINT/SIGTERM checks interrupt only the resource lifecycle: exits 130/143, with the observed isolated context
gone before owner stop. They are not full-walk acceptance results. The candidate full walks verify success teardown;
the failing setup probes retain failure teardown. All eight helpers are complete/inactive, profiles removed and
owned task processes gone. P1000 and Nas1 scratch were deleted; no servers, recorders or port forwarders were
started. The mailbox waiter ended, its heartbeat is no longer listening, and no final waiter was armed. The clean
unlanded worktree is retained for root cleanup. Installed helper history remains under its normal lifecycle.

Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-settings-dialog-gate-20261012/`, **96-entry** `SHA256SUMS`, SHA-256 **`4f593a78cfc35cb1a1dc51a6ecb12af8813ed77ad5a8d4f39257d8c995eef6db`**. It contains immutable inputs, actual tool
hashes checked before every P1000 run, full views/failed views/page errors/findings, unedited stdout/stderr,
helper start/stop receipts and logs, setup/projection/teardown proofs and cleanup receipts. Compact details are in
[result.json](result.json). `node --check`, `git diff --check` and the deterministic preservation checks pass.
