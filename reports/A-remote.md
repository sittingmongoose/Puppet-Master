# A-remote: remote PM7 parity

Status: Windows qualification failed; Mac qualification is in progress under lead reassignment.
Branch: `concept/pm7-parity-remote-20261019`. Base: `f9536abd6a`. Lead owns integration and landing.

## Mechanism

`--host windows|mac` opts into GPU Browser Fleet. Each worker has a separate Chrome process and serial baseline/candidate sequences. Inputs use the original virtual file URL and exact-byte CDP Fetch.fulfillRequest delivery; no browser filesystem or UNC access occurs. No LAN web server, TLS exception, browser rendering flag, hashing replacement, mask or implicit tolerance is required. Local admission, navigation, preparation and comparison behavior stay unchanged. Remote concurrency accepts 1..8; local remains 1..6.

Remote CDP defaults to authenticated SSH. P1000-to-Windows SSH forwarding fails with `administratively prohibited`; Windows uses the explicit supported `--remote-cdp lan` option. There is no automatic fallback. The trusted-LAN listener is revoked by session stop. Mac uses default SSH.

Every row records host, GPU renderer, Chrome version, session, transport and document URL. One browser process renders both sides. Remote PID values are never read from local /proc; memory covers controller RSS only. Minute keepalives renew leases. Normal completion, startup failure and signals stop and purge owned remote sessions; per-browser lifecycle receipts remain in native reports.

Remote navigation matches the exact frame/loader returned by Page.navigate, buffering early matching load events and ignoring an old blank-page load. Unit regressions cover that wait. This guard did not eliminate the observed hidden-DOM ordering drift at three workers; its cause remains unestablished. Default local navigation is unchanged.

## Windows proof

Final transport source: `52ec1084f1` (original DOM descriptor metadata added; gates unchanged). Windows Node 22.18.0 ran 15 unit tests: 15 pass, no skips. Controller tests also pass. The four generator checks and four reference hashes pass; no generated HTML, live source, Plans or governance artifact changed. Preparation/capture and comparison gates are byte-identical to f953 after removing only added browser metadata from the comparison function.

Capped proof: **FAIL**. Selected concurrency: **None**. Both proofs use the same six IDs (Basic Dark, Retro Light, NieR Dark; Home rest/theme-menu; wide; reduced motion).

| Probe | Workers | Result | Exact passes | Expected/actual failures |
|---|---:|---|---:|---|
| self | 2 | PASS | 6 | none |
| mutation | 2 | FAIL | 2 | basic-dark--home--rest--wide--reduced, basic-dark--home--theme-menu--wide--reduced, retro-light--home--rest--wide--reduced, retro-light--home--theme-menu--wide--reduced |
| self | 1 | FAIL | 4 | retro-light--home--rest--wide--reduced, retro-light--home--theme-menu--wide--reduced |
| mutation | 1 | FAIL | 2 | basic-dark--home--rest--wide--reduced, basic-dark--home--theme-menu--wide--reduced, retro-light--home--rest--wide--reduced, retro-light--home--theme-menu--wide--reduced |

The mutation changes Retro Light Home tab font from 12px to 13px. Its two target rows must fail; all four controls must pass exactly. A proof pass is validation of that expected result, not a parity label on the mutation. Native failed reports/captures remain unchanged.

## Concurrency and transport diagnostics

Initial plain HTTP failed before comparisons because native WebCrypto was unavailable. HTTPS and whole-document HTTPS probes exposed intermittent hidden DOM ordinal shifts with zero changed pixels in controls. Returning to the original file origin removed origin differences but did not establish a general cure. A committed three-worker same-input proof passed 6/6; the matching mutation proof had four extra control failures. Independent Node controllers at six simultaneous sessions also failed controls. These failed datasets are retained and never relabelled. A serial committed proof passed four controls and failed exactly two targets. The fresh, uncontended two-worker sequence failed controls. Its one-worker fallback also failed: identical Retro Light states differed on 366 paths, including 354 DOM-only and 12 layout records, with zero pixels. No Windows concurrency qualifies. The lead stopped further Windows attempts after one descriptor diagnostic and reassigned LeftRail to a qualifying Mac; otherwise the VM takes it. An equal-length mutation was proposed but rejected for qualification and was never run.

A separate four-load diagnostic retained body-child IDs/orders and stable style hashes in its one-browser Basic Dark sample. It does not establish the cause of the higher-concurrency drift.

## Datasets

| Dataset | Host | GPU | Chrome | Completed | Raw exact | Selected |
|---|---|---|---|---:|---|---|
| LeftRail candidate | pending | pending | pending | pending | pending | pending |
| Mac proof copies | pending | pending | pending | pending | pending | pending |

## Evidence

Native JSON records every PNG path and SHA-256. The following index identifies the dataset/provenance files; all paths are Linux-readable. Raw evidence is outside Git.

| Path | SHA-256 |
|---|---|
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/inputs.json | `3dbace7ca03530369adc081ca71abe0b4d3d3ca5f8f7df0195fd503044ea0d2a` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-test-provenance-52ec.json | `e3dc9a5438807178def2995ea8457df8a02cf736915995c573e4064e4e155f2c` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/unit-tests-windows-52ec.log | `e405bcd89750f5e549169429617a3e94cdfa5b2160b0040c446b82b8eea5e053` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/unit-tests-navigation.log | `3b7470bb59255e6c221ad2a2be721f067458c6fac4da0490267f025a78a8ce4a` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/capped-proof/validation.json | `db2aeadc1ac47c443c70b9ac34981c0f18af46ac2979f9ce14a1a0f6c4c18d70` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-proof-validation.json | `2d260a1b197d858a9798b2f347b2a2bc0fc89c125db31637ccdac420a414a3ef` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/gate-identity-52ec.json | `7142677235a4941f62baaae0e37bf6124184e6241f6e34b65ce7527538ebd5c8` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/debug-dom-order.json | `a99e1d9a7c764c4ed08efc889fde4e08345e46fd9d3f5d85ac65c70f404b2e03` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-main-six-final/report.json | `9885f30601521aa177511b998ab7bebd7c0e3bbbaa7afaba8dbb95dc877ff34c` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-sensitivity-six-final/report.json | `afe880ff99e4e7b512423102bd2b19350d9c32b3270fd3fbf9d944a8c152e718` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-isolated-proof/validation.json | `5d1c4914d61aef3fb6007a4eb0ce6fc0ec95e705ff0284087c16c0696a09c3e2` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-main-six-loader/report.json | `a100dc80f2854e20bab00b60ab04c89fc75aeb1f28b52c9873c2bc494bb3192a` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/windows-sensitivity-six-loader/report.json | `1b87dccd3c2642705d3ad7e89641da2b51bcb87b75ee3a5939327e5dc26be78f` |
| /mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/proof/A-remote-transport.json | `1be6cc12667216498edb6dc79c04932e7889e1428f7322e489ccb3db62b4225f` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/capped-proof/self-2/report.json | `916688d15cb513efd8f8000f52f1dcbb65c13e1615b5d19a9c05c6caae668bef` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/capped-proof/mutation-2/report.json | `4b423d6e78385d77c7c433c178fccc546ca7090b06eac12cb9c4cafefece02d1` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/capped-proof/self-1/report.json | `a77c58825a2ed3141ec68ff6ff2e1c6591a1362a9f13f4a21d23d284ceb1aa36` |
| /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A-remote/capped-proof/mutation-1/report.json | `4dd4d6e448c076723f20b9bf2139be9a778e71abbd14b49fe09cca6fbf98e9fe` |

## Cleanup

Completed proof sessions were stopped and purged, including failed startup/transport probes. Matrix/follow-up cleanup is pending until those datasets finish. No local VM browser, recording, dev server or scratch worktree was started. The assigned unlanded worktree and pushed branch remain for lead integration. Temporary controller/Windows unit-test copies will be removed after final reporting.
