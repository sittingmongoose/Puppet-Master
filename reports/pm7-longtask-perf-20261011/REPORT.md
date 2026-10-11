PM7 count and density observer investigation — final post-publish verification, 2026-10-11

The proposed source fixes reduce repeated selector traversal. On published main `62f37f65df4399c3de1f7fbaf654f3baea1cb287`, three paired Chrome traces show median cumulative observer time falling from **98.203 to 1.419 ms (98.6%)** for rail D counts and from **45.467 to 2.250 ms (95.1%)** for home density enrollment. These are totals over a three-command interaction, not per-keystroke timings. No individual target callback in this run reproduces the previously reported 217/135 ms figures.

The source fix is commit `5d2d83465fb4850daa1dad709c803b71da33797b` on `research/pm7-longtask-perf-20261011`; generated Home output is recorded by `cc1bdeb41eabead5aa174cb3662513a69a44989d`. The branch is rebased onto the coordinator's panels/terminal publish and pushed. This is a proposal for `leftrail-polish-lead` and the Claude Opus base-page owner to review and apply. Nothing is landed, and this investigation makes no visual or design decisions.

The primary metric sums DevTools `FunctionCall` durations at the exact source line of each MutationObserver callback. The rail callback includes its count-processing callers; the density callback includes enrollment and its synchronous work. All six trials use the same harness and exact input hashes.

| Target | Before: median total | After: median total | Reduction | Largest individual callback, before / after |
|---|---:|---:|---:|---:|
| Rail D count observer | 98.203 ms | 1.419 ms | 98.6% | 37.342 / 4.516 ms |
| Home density observer | 45.467 ms | 2.250 ms | 95.1% | 12.440 / 1.101 ms |

| Trial | Rail before / after, total ms | Rail callbacks before / after | Density before / after, total ms | Density callbacks before / after |
|---|---:|---:|---:|---:|
| 1 | 57.055 / 0.230 | 10 / 10 | 39.955 / 1.602 | 40 / 39 |
| 2 | 132.084 / 4.980 | 12 / 13 | 48.415 / 2.250 | 42 / 46 |
| 3 | 98.203 / 1.419 | 12 / 14 | 45.467 / 6.139 | 42 / 45 |

Other page work still produces long tasks. Median observed count is 9 before and 11 after; median summed duration is 3,146 / 1,828 ms, and median trial maximum is 2,004 / 582 ms. After trial 3 still has a 2,208 ms long task. These whole-page figures provide context, not an isolated causal estimate or a claim that all typing stalls are fixed. Existing rail `applyPanel`/`applyWords`/`applyRows`/`applyDetail`, demo activity and terminal render work remain outside this patch. The already-fixed Usage drag-start path was skipped.

The traces show repeated queries rather than demonstrated layout thrashing: there are **zero nested `Layout` or `UpdateLayoutTree` events inside either target callback in all six trials**. Before CPU sample stacks corroborate `querySelectorAll → applyCounts` and `querySelectorAll → $$ → enroll`. Chrome emits negative sampling deltas in the separate CPU profiles; the diagnostic script clamps these to zero. Sampled aggregate times are not used for the headline numbers.

Rail D originally responds to any observed text or child-list mutation by scanning all nine panels with `COUNT_SEL`. It searches unchanged descendants, then discards unchanged values through `_dCount`. The selector covers `.sh-hcount`, `.fm-count`, `.pm-sumcard-h .c`, `#fmHintCount`, `#fmSelCount` and `#fmSelChipN`.

The rail source changes are in `Concepts/leftrail-redesign/src/concepts/d/30-motion.js` and `90-register.js`. The numeric parsing, cached state and `rollCount` body move unchanged into `applyCount`. Mount and explicit callers retain `applyCounts`. The mutation path collects matching ancestors of changed text/children and counts in added subtrees, deduplicates them, filters detached elements, and preserves the previous panel/document order, including outer counts before nested counts. It runs in the same observer delivery, with the same animation direction, duration and easing. No scheduling delay is introduced.

The base `installHomeDensity` definition is in the pinned input `Concepts/Onboarding concepts/TestPMConcept.html:81571`. Its `enroll` function previously scanned the entire document for `.pm-home-surface` after every body child-list mutation, then discarded already-enrolled surfaces through a WeakSet. The measured published fixture has 19,593 elements in every trial. Ordinary terminal output does not require searching all of them to discover new surfaces.

The editable density fix is a guarded `PATCHES` entry in `Concepts/onboarding/opus-5.5/tools/build.py`, outside the PMH entries. It retains the initial full scan and explicit preset-triggered scan, then checks added elements and their descendants on body mutations. WeakSet enrollment, ResizeObserver registration and synchronous `syncHomeSurface` remain. The pinned base is untouched: SHA-256 `b3888fad4993f484ab4548e9ff212ec0042fa0a912947a7f316514db939326be`. The benchmark measures the recurring observer during typing; initial startup enrollment is covered separately below.

Chrome `155.0.8059.39` runs on Nas1 through `agent-browser start --url` and Playwright `chromium.connectOverCDP`. Each alternating before/after trial owns a fresh Chrome profile, so persisted terminal history cannot affect the comparison. The viewport is 1400 × 900, `?o55=off`, Basic dark, normal motion. The page loads at normal CPU speed; CDP applies 4× CPU emulation during tracing. The first running PMT terminal receives `ls -la`, `cat Cargo.toml`, and `git log --oneline -10`, with 15 ms typing delay and a 900 ms wait after each Enter. Every trial executes exactly those three commands successfully, exits 0, and records no page errors. The harness retains timeline/stack events and a separate 200 µs CPU profile. No video or GPU performance measurement was taken.

The before input is generated PMConcept7 at published main; the after input is the branch's regenerated PMConcept7. Their decompressed SHA-256 values are respectively `5715ffa181d0c59053e1d9dfbc3bb6e36c978f91ec1eda28317d0f3e1a13cad0` and `e5cdeeada06e08825605d83d71a0a3e88730b5881b3e7069f21cc85dc9b72322`. Only the `pm7-t23-shell-adjustments` and `pm-rail-js` script blocks differ. All non-script HTML and all 36 style blocks are byte-identical.

The paired normal-motion behavior check passes **23/23 cases**, with identical recorded state and animation calls and no page errors. It covers direct/subtree count insertion; character-data, child-list and nested text changes; numeric/non-numeric transitions; nested count order; unmount/remount; surface insertion; compact/expanded/tall resizing; reparent/reinsert; and preset-triggered density updates. This supplies dynamic-path coverage that reduced-motion screenshots cannot show.

Screenshot verification covers the dashboard Home surface, Chat, and all nine actual rail panels: Files, Search, Source, Git, Docker, Testing, Run, Agents and Artifacts. Every panel is opened through its rail icon and checked for visibility before capture. All five looks are checked in both modes at 1920 × 1080. Every final capture uses the same controls: a fresh profile per look/variant, reduced motion, disabled animations, hidden caret, fixed Date, seeded Math.random, Usage live/hour updates off, the three specific elapsed/cooldown demo intervals paused, settled fonts and the same 1921 → 1920 viewport refit. The timing and behavior runs use normal motion.

| Look | Light: exact / checked | Dark: exact / checked | Remaining differences |
|---|---:|---:|---|
| Basic | 9 / 11 | 11 / 11 | Files and Home |
| Friendly | 11 / 11 | 11 / 11 | None |
| Glass | 9 / 11 | 11 / 11 | Chat and Home |
| Retro | 11 / 11 | 11 / 11 | None |
| NieR | 11 / 11 | 11 / 11 | None |

The final matrix is **106 exact pairs out of 110**, with identical image dimensions and crop geometry for every pair. This is one complete uniform pass, with no selection across recapture phases. Comparison uses exact RGB equality, with no tolerance, mask or text normalization. Difference bounds below are inclusive crop coordinates.

| Surface | Changed pixels | Maximum RGB channel delta | Difference bounds |
|---|---:|---:|---|
| Basic light Files | 13 | 1 | x 7–15, y 186–189 |
| Basic light Home | 66 | 1 | x 18–18, y 469–603 |
| Glass light Chat | 7 | 16 | x 1–3, y 984–988 |
| Glass light Home | 328 | 1 | x 234–488, y 443–590 |

A fresh-profile identical-before-input control checks Basic and Glass Home/Chat/Files in both modes: **10/12 pairs are exact**. It reproduces the Glass light Home difference with the exact same two PNG byte patterns, in reverse order, despite identical input HTML. It also produces five changed pixels, maximum channel delta 3, at the same Chat corner in Glass dark. All six Basic control pairs match. The control supports raster variability for Glass Home and the Chat corner; it does not reproduce every main exception or establish the cause of the larger light-Chat delta. **Strict bitmap identity remains unestablished for the four main exceptions.** Claude Opus owns their visual review and acceptance. No CSS, tokens, layout rules or product presentation choices were changed to obtain matches.

The generated pages were produced by the documented pipeline, never hand-edited:

```sh
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7
python3 Concepts/home-redesign/tools/build_home.py
python3 Concepts/leftrail-redesign/tools/build_rail.py
```

All three corresponding `--check` commands and `git diff --check` pass. Generated `Concepts/PMConcept7.html`, `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html` and `Concepts/HomeTestPMConcept7.html` all have SHA-256 `e5cdeeada06e08825605d83d71a0a3e88730b5881b3e7069f21cc85dc9b72322`. `Concepts/LeftRailPMConcept7.html` has `52f82c54eb10f5be57830bdfecec4eedca8e6b887e90b2b5c42135f2e8a61573`. No Plans or governance artifacts changed.

Final raw evidence is retained under `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/`. Its manifest binds 48 files, including all raw traces, CPU profiles, trial receipts, exact HTML inputs, screenshots and replay tools.

| DevTools raw trace path | SHA-256 |
|---|---|
| [traces/before-1/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/traces/before-1/trial-1.trace.json) | `6c5bf18a645a9531c5003dfd5b8c7fdadfbb2378548d49b2cbc578b101070aca` |
| [traces/after-1/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/traces/after-1/trial-1.trace.json) | `5eafd8a39c312b32889cb96cc634885c557ebbb00d40037f7cbd22870b12187f` |
| [traces/before-2/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/traces/before-2/trial-1.trace.json) | `20631cf0c6f66092e87eba72245d86e507083030ecb9d3c14997f3f203777a32` |
| [traces/after-2/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/traces/after-2/trial-1.trace.json) | `4eee9398b413446faf16bac8b9df37f6cdccc45970b98e515674687d8b9ae4b8` |
| [traces/before-3/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/traces/before-3/trial-1.trace.json) | `2c663f0cfd88276038b37a8c05762afc85ca794fe63d2a69b83813dd2c1a477d` |
| [traces/after-3/trial-1.trace.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/traces/after-3/trial-1.trace.json) | `b1db323ed15d854473612f304ae0760ca5960dba197f3ff8c86dd51a876a902a` |

| Supporting evidence path | SHA-256 |
|---|---|
| [SHA256SUMS](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/SHA256SUMS) | `c983b05234fd346c73029b0a1a316bf2a84eaf693de3a2c9db2e0a2448ec5eee` |
| [trace-summary.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/trace-summary.json) | `9a0c04572c8698e190fd95fa6ee4c3f1838e0ebe112bc36f944070214af41b50` |
| [visual-final.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/visual-final.json) | `a563841e898039b7eb271a5bc9008f88e06eac9b49d19eef9faffa83f25724ec` |
| [screenshots.tar.gz](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/screenshots.tar.gz) | `2d6dfdb9cbfab91aaca59192bdca8d618abb75bfa0cb3c537796745409fd9a25` |
| [behavior.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/behavior.json) | `7abf50c6a3eba62bf7f8d04c96220aa49c2b5306601518a9d92959d3665b995e` |
| [source-proof.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/source-proof.json) | `853394cfeadaaeb0184c4a85f8f95d4cde5c1ca83120f2ca69e85fe49ff61b3c` |
| [build-checks.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/build-checks.json) | `5db59cd74eec2b821d754626ef28ad2a3243de7712b8edbc12e5851c3dbfd4e8` |
| [provenance.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/provenance.json) | `ea59679f2e1b03e7eca0a530e1a2a3cb9e9c2111b8a65b887eb904bc8c60be81` |
| [cleanup.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/cleanup.json) | `ebbc623230071b0ef96283b99e9b84779672654dbfbdc3514d74c9d026b54830` |
| [inputs/initial-before.html.gz](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/inputs/initial-before.html.gz) | `3a082ad221c4fbeb56d1cda963d59cf88fedb524ad1e91dd248af38e29458b6b` |
| [inputs/initial-after.html.gz](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/post-publish/inputs/initial-after.html.gz) | `9dd459f5a5f7bb2f2275d43e93dee6382bcea901c659f7352523c2118a3fa301` |

`visual-final.json` records every PNG path within `screenshots.tar.gz`, its SHA-256, exact pixel comparison and crop geometry. The archive contains all 220 main PNGs and 24 control PNGs; every archived PNG hash and both decompressed input hashes were verified. CPU profiles, trial metadata and exact replay tools are covered by the manifest. The evidence README describes replay prerequisites and the controlled screenshot fixtures.

Earlier pinned evidence remains unchanged under the parent directory. On the pre-publish terminal review snapshot `dbffa7a1b20838b04b9b66badf1835d2bc206296`, the same source proposal yielded median observer totals of rail 118.129 → 1.259 ms and density 59.096 → 2.043 ms, with 106/110 selected screenshot pairs exact. These earlier timings and image selections are historical; the complete post-publish run above is the primary result. The parent [SHA256SUMS](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/SHA256SUMS) has SHA-256 `47fffb0dbc6232680a9b82086207b01d6454d603cadd2554268dd39edb419b88`.

The prior direct base-page boot check addresses `home-panels`' message `1011084726-4ac2`: workspace `applySurface` can add the class to a connected base node without inserting it. Its earlier `DOMContentLoaded` listener completes `renderLayout` before `installHomeDensity`; the fix retains the initial scan. Both original-base inputs enroll all five connected surfaces (`bottomPanel`, `chatPanel`, `dashboardView`, `editorPane1`, `editorPane2`), including the hidden second editor, with zero missed targets and identical density state. This boot check is separate from the terminal typing benchmark.

The additional original-base matrix is **10/10 pixel-exact**, covering every look in both modes with the same settled-font/refit procedure. The two NieR pairs become exact with their specific live cooldown interval paused on both inputs; no mask or RGB tolerance is used. That check used main `618fd35e0e52eac0d6df5d1e3ff55d5c0a2bbf4b` before the panels/terminal publish, with unchanged non-script markup and all 33 style blocks. The separate [boot-followup/SHA256SUMS](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/boot-followup/SHA256SUMS) has SHA-256 `77f76156bca09c9e948cd9be3f0187fd4c7692b5783a1f4f6cc85e182fcdbce9`; [boot-check.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/boot-followup/boot-check.json) has `04a53971eb78c721365f617e7f86f99c8b75a40ef3f93754c200b131723d388a`, and [base-visual-final.json](/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-longtask-perf-20261011/boot-followup/base-visual-final.json) has `e2c695eb35aab16ed0430d880962fa5b9929d57c998e27d2a25e1559f1cc3865`.

All 21 browser sessions owned by the final run are stopped. Their profiles, logs, temporary HTML, experiment runtime, comparison environment and scratch are removed; only the requested evidence and committed result remain. The earlier run's temporary runtime was already removed. The mailbox waiter stays armed for coordination. No landing was performed.
