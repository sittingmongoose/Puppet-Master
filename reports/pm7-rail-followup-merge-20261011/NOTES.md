# PM7 rail follow-up mechanical preparation — 2026-10-11

Prepared for `home-redesign-planner` by `codex-pm7-rail-followup`. Landing remains held for the planner's source/test custody review and owner requirements. This worker has no main, shared-checkout, landing-lock, product/look/canon/policy, owner-wake, or front-end repair authority.

## Source custody

- Current composition base: `2f91e7a6228e5d3b50be997a562eb263bef059bc` (`origin/main` and clean bound worktree HEAD at start).
- Original owner branch: `fix/leftrail-check-dock-perf-20261011`, pushed head `60c76e6642b48a6fb1590292550f7dd4197ff1ea`; generated commit parent `02b7deb4ccaebc422ec6441eaf1561a8e93101ba`; that source/test commit's parent is `2c35101f93ab08da6f4597f38d4bc23e4fa27573`.
- Owner mail `1011203216-00f0` confirms Windows T3 thread `7140c950-23e7-4c5b-bc79-3eef756d7fb9` is held/quiescent. Its saved mail SHA-256 is `36e656c3f778f8d956d472ed44f4967f36a60cc1293607fa60ec63d5160ce2f4`.
- `30-motion.js` and `90-register.js` are the exact owner-reviewed rail half of `5d2d83465fb4850daa1dad709c803b71da33797b`; report commit `0506e8663a5575a7a973b115102cd417532bd782` was read. The unchanged `00-d.js` supplies `PANEL_IDS`, `PANEL_SEL`, and `inPanels`. `rail_boot.mjs` adds the owner's `L.dock` / `PMW.narrow.frozen` test-only change atop the already-landed settle wait `fb80d4a04bd4954473b01bf4ea43744d6d05d5fb`.
- All three current-base source/test files were byte-identical to the original base. Only their exact approved diff was applied with `git apply --check` and `git apply`; no source composition change, conflict, repair, or generated-HTML merge occurred. Composed source/test files equal the original owner head byte for byte.
- Original and current source patch SHA-256: `ed9c6f802b87f48db3b28bf1b461567e81ae54a39897bd271c216df2ac34127f`; both stable patch IDs: `f387ec4f720cc46f998a5f869af9b918ba2e3517`.
- Original owner evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/leftrail-check-dock-perf-20261011/`; `SHA256SUMS` SHA-256 `45b8f4adfea7841e00ff311c25b9b7c27338bf03e51e81a2d303ccd11019a572`. The manifest and all six entries verify. Prior results are historical, on the old base, and do not substitute for this composition's rerun. Glyph rail review and the Errored-word colour question remain NOT_DONE and outside this preparation.

## Exact owned change paths

Source/test:

- `Concepts/leftrail-redesign/src/concepts/d/30-motion.js`
- `Concepts/leftrail-redesign/src/concepts/d/90-register.js`
- `Concepts/leftrail-redesign/tools/rail_boot.mjs`

Required builder outputs:

- `Concepts/PMConcept7.html`
- `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html`
- `Concepts/HomeTestPMConcept7.html`
- `Concepts/LeftRailPMConcept7.html`

Compact result files: this `NOTES.md` and `SHA256SUMS`. No Plans/governance/reseal changes. Original owner branch/worktree preserved.

## Mechanical gates — PASS

Linux regeneration followed the existing recipes, in dependency order:

```sh
python3 Concepts/leftrail-redesign/tools/build_d_css.py
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7
python3 Concepts/home-redesign/tools/build_home.py
python3 Concepts/leftrail-redesign/tools/build_rail.py
```

All four corresponding `--check` commands pass; `parity.py --list` passes with zero missing fixture pairs (Files 87, Source 114, Docker 149). `git diff --check` passes. `node --check` passes for the three owned source/test files and unchanged helper, and for every executable inline script in all four generated pages: 117 source/generated entries, 30 unique generated scripts.

Each regenerated page equals its current-main bytes with only the exact approved `30-motion.js` and `90-register.js` source blocks replaced. Every other byte, including embedded look assets/styles and other current-main source, is preserved. `d.css` is unchanged. No unexpected generated path or content change occurred.

- Published/onboarding/Home HTML SHA-256: `322fc257b7e6822b14e6d9e610f86b51b1fca1a107170f9fa4397f52531c6f5a`.
- Rail review HTML SHA-256: `877f467de5a8fa4ad33f3f25b3f57c1c6a0ee9c6fd6151cfa34cd34ce1c78c23`.

Tested source/output commit: `978a01e97ffbe7fba2fd18ef32a3e2ad7a8e5e8a`, pushed to both remotes before the rerun. Final reporting changes only this report and its checksum manifest.

| Source/test file | Composed SHA-256 (also original owner head) |
|---|---|
| `30-motion.js` | `f52fdb3b052860ca5145ab8683acf57daa0823d26cb60822108d7ae938d45276` |
| `90-register.js` | `5b6cef9614b8f1b4d9bacf84be7306983dfafeb095446e783980897a3443d949` |
| `tools/rail_boot.mjs` | `171547ed269ccb211e8bd12f66a00382c42ca19c6bdf9de105325ddc8f6e349b` |

Existing builder informational output about the onboarding universal selector was retained without repair or waiver.

## P1000 rerun — PASS

Canonical GPU guide read. Initial normal-admission check at `2026-10-11T20:37:22Z` showed one other active helper browser, 38 GiB available memory, and 83 GiB free local disk. Other users remain present/allowed; this is a shared-device acceptance rerun with at most one owned helper browser at a time, no recording, exclusivity, performance, or certification claim.

The existing owner recipes ran serially with the unchanged composed `rail_boot.mjs`, at the default 1600 × 1000 viewport:

```sh
node Concepts/leftrail-redesign/tools/rail_boot.mjs <external-out>/glassfirst --concepts d --restore --themes glass-dark,glass-light
node Concepts/leftrail-redesign/tools/rail_boot.mjs <external-out>/review --concepts d --restore
node Concepts/leftrail-redesign/tools/rail_boot.mjs <external-out>/published --concepts d --restore --page Concepts/PMConcept7.html
```

All use the default review `?rail=current` reference and `?o55=off`. Exact commands, working directory, timestamps, time bounds, admission, exit codes and results are retained in `p1000-recipes.json`. Mode limits were 900/1800/1800 seconds, with a 65-minute overall test deadline. A transparent helper observer recorded start/stop ownership while forwarding the original helper arguments/output/status; the owner harness bytes and assertions were unchanged.

| Mode | UTC interval | Seconds | Exit / failed checks | Exact restore looks |
|---|---|---:|---|---:|
| Glass-first | 20:41:19–20:48:56 | 456.592 | 0 / 0 | 3 |
| Review | 20:48:56–21:02:02 | 786.804 | 0 / 0 | 9 |
| Published | 21:02:03–21:15:03 | 780.054 | 0 / 0 | 9 |

Every mode reports Quadro P1000 (`ANGLE (NVIDIA Corporation, Quadro P1000/PCIe/SSE2, OpenGL 4.5.0)`), zero reference/concept console errors, zero missing actions, and an 11 px type floor across all nine panels. All three reference-baseline comparisons are exact. Every restore uses all nine panels plus the activity bar, with zero differing snapshots, zero leftover D marks, and the skin attribute restored. These are the unchanged harness's settled, normalized DOM snapshots.

Glass-first covers Glass dark/light plus NieR. Review and published cover all nine restore looks: Basic, Friendly, Glass and Retro in dark/light plus NieR. The previous Glass-first raw summary also records three looks, despite the owner's shorthand describing the overall nine-look result.

All **103** staged source/asset/HTML files, including the unchanged harness and pages' embedded look assets, match the committed input hashes before execution and remain byte-identical afterwards. The exact committed input archive is retained as `inputs/composed-inputs.tar.gz` (SHA-256 `10be7911f15f71ee99ad05fe4fe3b8a38e8f32ff9c6e2c27988a68889ca2f2c1`). No new failed source/test assertion occurred; no repair or gate waiver was made. Original owner branch remains at `60c76e6642`, and observed remote main remains `2f91e7a622` at the closing custody check.

## Evidence and checkpoint

Raw custody, command receipts, gate logs, inputs, results and cleanup receipts are retained under `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-rail-followup-merge-20261011/`. Its final `SHA256SUMS` has SHA-256 `b5358f6a8392a7e03cfb20a55e18b7363a43d6abc358bfa00d2cce327e818e3d`; the adjacent repository `SHA256SUMS` binds that manifest and every evidence file. Full source/blob/HTML hashes are in `custody/source-custody.json`, `gates/generated-custody.json`, `gates/syntax.json`, and the before/after input manifests.

Result JSON SHA-256:

- `glassfirst/rail-boot.json`: `f5a14a08cd91acf0472be640316e4561f7ede3193e609f7c3337eb36cd8d3004`.
- `review/rail-boot.json`: `c8f375169a26bdb23c3368119a9c05bd431423c3ba0c0205499653d6aa3a6eec`.
- `published/rail-boot.json`: `cdddfe96c419a5d7cc75019428edc43507453b31854be9b5e93d4618a7864a9d`.

Cleanup: all 15 owned helper sessions are stopped; observed owned concurrency never exceeded one. No owned browser/profile, runner/test process, default helper log, server, recording, or P1000 scratch remains. Necessary unit logs were copied into external evidence before removing the owned runtime copies. Other sessions/jobs were untouched. The bounded mailbox waiter is disarmed at the final checkpoint; no owned automatic task remains. No worker/subagent or additional worktree was started. Local temporary test/browser/server artifacts are absent; the bound **unlanded** result worktree and branch are retained for the planner. Main/shared checkout/landing lock remain untouched. Landing stays held pending planner custody review and owner requirements; the queued glyph rail review and Errored-word colour decision remain outside this worker's authority.
