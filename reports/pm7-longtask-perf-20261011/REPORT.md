PM7 count and density observer investigation — 2026-10-11

The proposed source fixes reduce repeated selector traversal while preserving the existing count update and density logic. Across three paired Chrome traces, median cumulative observer time falls from **118.129 to 1.259 ms (98.9%)** for rail D counts and from **59.096 to 2.043 ms (96.5%)** for home density enrollment. These are totals over a three-command interaction, not per-keystroke timings. No individual target callback in these traces reproduces the previously reported 217/135 ms figures.

The fix is commit `97a3fd9bdeab5c84774f2b9af47955a18ae4b15a` on `research/pm7-longtask-perf-20261011`, based on main `618fd35e0e52eac0d6df5d1e3ff55d5c0a2bbf4b`. It is a proposal for the Claude Opus owners to review and apply. Nothing is landed. The coordinator requested this pinned report while the panels/terminal publish is pending; rebase and final paired timings on that publish remain a follow-up when `home-redesign-planner` mails its landing receipt.

The primary timing metric is the sum of DevTools `FunctionCall` durations at the exact source line of each MutationObserver callback. The rail callback includes its `applyCounts` callers; the density callback includes enrollment and its synchronous work. All six trials use the same harness and exact input hashes.

| Target | Before: median total | After: median total | Reduction | Largest individual callback, before / after |
|---|---:|---:|---:|---:|
| Rail D count observer | 118.129 ms | 1.259 ms | 98.9% | 29.075 / 3.206 ms |
| Home density observer | 59.096 ms | 2.043 ms | 96.5% | 15.132 / 0.757 ms |

| Trial | Rail before / after, total ms | Rail callback count before / after | Density before / after, total ms | Density callback count before / after |
|---|---:|---:|---:|---:|
| 1 | 118.129 / 6.622 | 12 / 14 | 52.936 / 2.043 | 42 / 42 |
| 2 | 81.655 / 1.020 | 10 / 12 | 80.688 / 2.427 | 40 / 40 |
| 3 | 168.384 / 1.259 | 11 / 10 | 59.096 / 1.930 | 42 / 39 |

Other page work still produces long tasks. Median observed long-task count is 33 before and 24 after; median summed duration is 3,917 / 2,323 ms, and median trial maximum is 815 / 631 ms. Before trial 3 contains a 3,519 ms outlier; its longest target callback is 29.075 ms. These whole-page figures are context, not an isolated causal estimate or a claim that terminal typing is now free of long tasks. Existing rail `applyPanel`/`applyWords`/`applyRows`/`applyDetail`, demo activity and terminal render work remain outside this patch. The already-fixed Usage drag-start path was not changed.

The traces show repeated queries rather than demonstrated layout thrashing: there are **zero nested `Layout` or `UpdateLayoutTree` events inside either target callback in all six trials**. CPU sample stacks corroborate `querySelectorAll → applyCounts` and `querySelectorAll → $$ → enroll`. Chrome emits negative sampling deltas in the separate CPU profiles; the diagnostic script clamps those deltas to zero. Sampled aggregate times are therefore not used for the headline numbers.

Rail D originally responds to any observed text or child-list mutation by scanning every one of its nine panels with `COUNT_SEL`. Terminal-related DOM changes can invoke the observer even when no count changed. It searches the unchanged descendants first, then discards unchanged values through `_dCount`. The selector covers `.sh-hcount`, `.fm-count`, `.pm-sumcard-h .c`, `#fmHintCount`, `#fmSelCount` and `#fmSelChipN`.

The source changes are in `Concepts/leftrail-redesign/src/concepts/d/30-motion.js` and `90-register.js`. The numeric parsing, cached state and `rollCount` body move unchanged into `applyCount`. Mount and existing explicit callers retain `applyCounts`. The mutation path collects matching ancestors of changed text/children and counts inside added subtrees, deduplicates them, filters detached elements, and preserves the previous panel/document order, including outer counts before nested counts. It runs in the same observer delivery, with the same animation direction, duration and easing. No scheduling delay is introduced.

The base `installHomeDensity` definition originates in the pinned input `Concepts/Onboarding concepts/TestPMConcept.html`. Its `enroll` function previously scanned the entire document for `.pm-home-surface` after every body child-list mutation, then used a WeakSet to discard already-enrolled surfaces. The final review fixture contains 19,570 elements in every trial; ordinary terminal output does not need to search all of them to discover new surfaces.

The editable fix is a guarded `PATCHES` entry in `Concepts/onboarding/opus-5.5/tools/build.py`, outside the PMH entries. It preserves the initial scan and the explicit preset-triggered scan, and checks added elements plus their descendants on body mutations. WeakSet enrollment, ResizeObserver registration and synchronous `syncHomeSurface` remain. The pinned base is untouched: SHA-256 `b3888fad4993f484ab4548e9ff212ec0042fa0a912947a7f316514db939326be`.

The measured review fixture is built from `origin/concept/home-terminal-20261009` at `dbffa7a1b20838b04b9b66badf1835d2bc206296` using its `Concepts/home-redesign/tools/build_home.py --out` pipeline. The after fixture copies only the three changed source files from the fix into that same snapshot and rebuilds. The two resulting inputs differ only in the `pm7-t23-shell-adjustments` and `pm-rail-js` script blocks. All non-script HTML and all 36 style blocks are byte-identical. The rail patch also passes `git apply --check` against the source files at the coordinator's rail answers pin, `a25b885a3e1dc9052eb8c1c8dd15fced12489406`.

This terminal review fixture replaces the original workspace and has zero `.pm-home-surface` nodes at boot. Its density timing measures the repeated document search during typing, with no new surface to enroll. The inserted-surface behavior cases and the direct base-page check below provide separate enrollment coverage.

Chrome `155.0.8059.39` runs on Nas1 through `agent-browser start --url` and Playwright `chromium.connectOverCDP`. Each of the six alternating before/after trials owns a fresh Chrome profile, so persisted terminal history cannot affect the comparison. The viewport is 1400 × 900, `?o55=off`, dark mode, normal motion. The page loads at normal CPU speed; CDP applies 4× CPU emulation during the recorded interaction. The first running PMT terminal receives `ls -la`, `cat Cargo.toml`, and `git log --oneline -10`, with 15 ms typing delay and a 900 ms wait after each Enter. All trials execute exactly those three commands successfully, exit 0, and record no page errors.

The harness captures DevTools timeline/stack events and a separate 200 µs CPU profile. The retained tools record categories, throttle, browser version, command receipts, input hashes and long-task entries. Nas1 uses intentional software rendering; no video or GPU performance measurement was taken. These figures are not directly comparable to a P1000 timing run.

Screenshot verification covers the dashboard home surface, chat, and all nine actual rail panels: Files, Search, Source, Git, Docker, Testing, Run, Agents and Artifacts. Each panel is opened through its rail icon and checked for visibility before capture. All five looks are checked in both modes at 1920 × 1080. Still-image capture uses reduced motion, disabled animations, a hidden caret, settled fonts and fixed wall-clock time; the behavior and timing tests use normal motion.

| Look | Light: exact / checked | Dark: exact / checked | Remaining differences |
|---|---:|---:|---|
| Basic | 11 / 11 | 11 / 11 | None |
| Friendly | 11 / 11 | 10 / 11 | Home: 1 pixel, maximum RGB channel delta 1 |
| Glass | 10 / 11 | 9 / 11 | Light Home; dark Testing and Artifacts, detailed below |
| Retro | 11 / 11 | 11 / 11 | None |
| NieR | 11 / 11 | 11 / 11 | None |

The final selected matrix is **106 exact pairs out of 110**, with identical image dimensions for all pairs. Comparison uses exact RGB equality, with no tolerance or mask. The four non-exact pairs are:

| Surface | Changed pixels | Maximum channel delta | Difference bounds within crop |
|---|---:|---:|---|
| Friendly dark Home | 1 | 1 | x 476–476, y 584–584 |
| Glass dark Artifacts | 19 | 3 | x 1–9, y 1–11 |
| Glass dark Testing | 25,151 | 3 | x 1–196, y 1–248 |
| Glass light Home | 328 | 1 | x 234–488, y 443–590 |

The first complete pass yields 89 exact pairs. The exceptions are confined to live elapsed clocks, Home, Testing and Artifacts. Static recaptures pause the two elapsed-clock demo intervals and Usage live/hour fixture updates on both sides. An identical-before-input negative control reproduces low-level raster variation and the existing NieR folded-fact variation without the patch. Settling fonts and performing the same 1921 → 1920 viewport resize on both sides removes the folded-fact difference. The final selection uses the original captures for the other 80 pairs, static recaptures for Friendly/Retro Home/Testing/Artifacts, and settled-viewport recaptures for Basic/Glass/NieR Home/Testing/Artifacts. Every selected phase and image SHA-256 is recorded in `visual-final.json`; all passes and controls are retained.

The remaining differences are low-level raster changes around blurred surfaces, with no observed text or geometry change after settling. **Strict bitmap identity remains unestablished for those four pairs.** This report does not grant visual acceptance; that belongs to the Opus owners. No CSS, visual tokens, layout rules or product presentation choices were changed to obtain a match.

The paired behavior check passes **23/23 cases** with identical recorded state and animation calls, and no page errors. It covers direct/subtree count insertion; character-data, child-list and nested text changes; numeric/non-numeric transitions; nested count order; unmount/remount; surface insertion; compact/expanded/tall resizing; reparent/reinsert; and preset-triggered density updates. This verifies the dynamic paths that reduced-motion stills cannot show.

The later `home-panels` reply (`1011084726-4ac2`) confirms that workspace `applySurface` can add the surface class to an already-connected base node without inserting it. A direct browser boot probe verifies the required ordering: the workspace's earlier `DOMContentLoaded` listener completes `renderLayout` before the shell-adjustments listener calls `installHomeDensity`. The fix retains that initial full scan. On both base inputs it enrolls all five connected surfaces (`bottomPanel`, `chatPanel`, `dashboardView`, `editorPane1`, `editorPane2`), including the hidden second editor, with zero missed targets and identical density state. The source patch needs no change for this path.

An additional **10-pair base-page matrix is fully pixel-exact**, covering Basic, Friendly, Glass, Retro and NieR in light/dark. It uses the same viewport, reduced-motion, settled-font and viewport-refit procedure. Eight pairs match in the first pass. The two initial NieR exceptions affect only the live `pm6DashCooldown` glyphs; recapturing with that specific demo interval paused on both inputs makes both pairs exact. No text normalization, mask or RGB tolerance is used. The base inputs also have identical non-script markup and all 33 style blocks. The before input is generated PMConcept7 at main `618fd35e0e`, SHA-256 `3486e2ee39a40d0b9942d3ca50926bea985e2b6a1f1b3935d6527afc55d89fbb`; the after input is the fix's generated PMConcept7, SHA-256 `27ad7191eb445b628750b6c0a7ef1b241b918ebae62e9a9322e768050a3c36a3`. The original 110-pair terminal review matrix retains its four explicit raster exceptions.

The branch's generated outputs were produced by the documented commands, never hand-edited:

```sh
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7
python3 Concepts/leftrail-redesign/tools/build_rail.py
```

Both corresponding `--check` commands and `git diff --check` pass. Generated `Concepts/PMConcept7.html` and `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html` have SHA-256 `27ad7191eb445b628750b6c0a7ef1b241b918ebae62e9a9322e768050a3c36a3`; `Concepts/LeftRailPMConcept7.html` has `579f89832da80debe49f6dbda741c458261739def3f9f437b4dcdf349a15f984`. These branch outputs are distinct from the retained terminal review inputs used for the paired traces.

Raw evidence is retained under `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/`. The [SHA256SUMS manifest](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/SHA256SUMS) binds the original 38-file bundle; its own SHA-256 is `47fffb0dbc6232680a9b82086207b01d6454d603cadd2554268dd39edb419b88`. The boot follow-up has a separate manifest below. All original evidence is unchanged.

| DevTools raw trace path | SHA-256 |
|---|---|
| [traces/before-1/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/traces/before-1/trial-1.trace.json) | `fff8c2078e7e44a94c2c6f649bc698f80f1c76af43dd0a403475cc9ae1785e73` |
| [traces/after-1/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/traces/after-1/trial-1.trace.json) | `d514bf31597a460739cbd84739aec7bc139582cad64d9030a5df82ed81da3b04` |
| [traces/before-2/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/traces/before-2/trial-1.trace.json) | `dac537693b9afd897a2ca245d86ce45078bc1567d509c3a6a6ee68d373f6ebcb` |
| [traces/after-2/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/traces/after-2/trial-1.trace.json) | `27795bea72266e306d9ac4ce6bf77c73cd81ec9a760f8b5823bb3f2dbaf89e37` |
| [traces/before-3/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/traces/before-3/trial-1.trace.json) | `79952be7f88070d68eaaae69a1da2cbea6d00b8e680a351026ee9a79d00ca777` |
| [traces/after-3/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/traces/after-3/trial-1.trace.json) | `4908ebbd5b641cd1ba2678ae0cc6e6ee3c0b4221685262699d9876a6d58b7bea` |

| Supporting evidence path | SHA-256 |
|---|---|
| [trace-summary.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/trace-summary.json) | `a1cf8b6bb5ee5fce9dab8159d8eef753bb76112f31daf0ad13cd38fb1227211f` |
| [visual-final.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/visual-final.json) | `6122afe8343f3b4c758c7d27a4de0a91a23bbf8e5540c36512347bfe03b28484` |
| [screenshots.tar.gz](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/screenshots.tar.gz) | `7efc0c1dc1f5d1af91573c99aed998fde740b73187419a536973f2e3c6870edf` |
| [behavior-initial.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/behavior-initial.json) | `7abf50c6a3eba62bf7f8d04c96220aa49c2b5306601518a9d92959d3665b995e` |
| [source-proof.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/source-proof.json) | `4a3a659e02452a3830463b49e99b408eb5309b2354c9e0bb2a32437f99d92451` |
| [inputs/initial-before.html.gz](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/inputs/initial-before.html.gz) | `d320693c3519767b75cb6decb0d9be1f3a039bafc53f49c82e650a48606bf3eb` |
| [inputs/initial-after.html.gz](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/inputs/initial-after.html.gz) | `9300d57ede69aec44e499b66fa20cb5ed3caa5ec8a49c1cc9fd05484cdde2b87` |

The decompressed before input has SHA-256 `acc418e933946d69f2d0b04133ea232068467852dab7cc1f9e54cf1d0d880787`; the after input has `8f3539b750e90b734eee35d92d28f30855e83145f580ac34c42e1a7351b93349`. CPU profiles, per-trial metadata and exact replay tools are covered by the manifest. All experiment runtime and raw captures remain outside the repository.

| Boot follow-up evidence path | SHA-256 |
|---|---|
| [boot-followup/SHA256SUMS](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/boot-followup/SHA256SUMS) | `77f76156bca09c9e948cd9be3f0187fd4c7692b5783a1f4f6cc85e182fcdbce9` |
| [boot-followup/boot-check.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/boot-followup/boot-check.json) | `04a53971eb78c721365f617e7f86f99c8b75a40ef3f93754c200b131723d388a` |
| [boot-followup/base-source-proof.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/boot-followup/base-source-proof.json) | `80d822729c2cd0f110372838bb229486ee9a132f2d27b8c19bebae68cb4bcb47` |
| [boot-followup/base-visual-final.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/boot-followup/base-visual-final.json) | `e2c695eb35aab16ed0430d880962fa5b9929d57c998e27d2a25e1559f1cc3865` |
| [boot-followup/base-screenshots.tar.gz](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/boot-followup/base-screenshots.tar.gz) | `733703178f27c91ea37831df2080b68cc89ce7daf3764ee3c9dc0da1594644b5` |

All owned browser sessions are stopped and their profiles removed. The temporary experiment snapshots, environments, discarded runs, scratch captures and browser logs are deleted. The mailbox waiter remains armed for the coordinator's publish notice.
