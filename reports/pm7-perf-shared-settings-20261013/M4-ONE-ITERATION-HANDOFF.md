# M4: one iteration failed; hand back to Opus

2026-10-14. **Do not ship M4. Exactly one focused source iteration was made after profiling, and it still fails the in-place stability contract.** No further repair was attempted. The Glass owner's direct `syncHost()` change removes the measured host-width bounce, but it does not fix the retained Settings update.

This is a report-only addition to `fix/pm7-perf-shared-settings-20261013`, whose pre-report checkpoint was `f4b0f52cfa`. The failed source lives only in the external checkpoint below. No M4 product source or generated repository page was committed; the build restored the worktree's source files. Nothing was landed on main.

## Before/after result and probe limit

Windows RTX 3090, Chrome 155, 1920 × 1080, DPR 1, normal motion. Compare the inherited private `m4-authorized-proto12` with `m4-astra-one-iteration`. These are older private compositions, not current-main builds. The M5 motion checkpoint is reused; the NieR checkpoint differs from final M10. Do not describe this as the combined M5/M6/M10 bundle.

The probe scrolls General to its actual bottom after hydration, where Notifications is the current workspace. The final driver falls back to the last manager row, `Nightly report readyNormal` (`.pm51-row`), and follows its replacement by the same id or the same tag and text within that workspace. Screenshot review found that its CSS visibility test does not account for scroller clipping: the fallback row starts above the reading line, fully clipped in Basic/NieR. **Do not treat its row number as a valid strict A1 anchor measurement.** The offline correction instead measures the manager panel's visible bottom edge from the same recorded ancestor geometry; this edge remains inside the scroller in every sample, and native screenshots show the panel/footer shifting. Its displacement happens to equal the fallback row's displacement. Both runs use the identical final driver. A trusted wheel releases any previous hold, four scroll/settle passes establish the bottom, then `PM12_KIMI.renderApp()` runs. Samples use requestAnimationFrame for about 1600 ms plus a final sample after 2100 ms. These are three canaries, not the complete A–F matrix.

| Look | Maximum visible panel-bottom displacement before → after | Scroll before → settled candidate | Candidate samples | Candidate transient section changes |
|---|---:|---:|---:|---:|
| Basic Dark | 443.609 → 609.609 px | 6535 → 5874 px | 167 | 47 |
| Glass Light | 425.000 → 609.000 px | 6914 → 6271 px | 62 | 10 |
| NieR Dark | 466.328 → 633.328 px | 6803 → 6294 px | 151 | 43 |

Every final sample resolves the same CSS-visible row, although its DOM node is replaced; this does not imply visibility through the scroller clip. No missing-row interval is established. The in-memory active section changes transiently and returns to the initial value; the saved projection stays unchanged in every sample. This is not a next-save or navigation-save test. No new measured retained-motion flags/animations were found on the instrumented original nodes; replacement nodes fall outside that identity set, so this does not establish full A4 acceptance.

Both compositions change the bottom spacer from 686 to 960 px in Basic/NieR, and 635 to 942 px in Glass. The manager detail subtree changes height while the row is replaced. These observations identify the remaining ownership/timing problem; they do not prove one isolated callback causes all displacement. The unchanged panel/footer visibly shifts after a non-navigation render, which rejects the in-place stability requirement without relying on the transient-section observation. A correct reading-line anchor selector remains work for the next authorized pass.

## Profile, then the single source change

Before changing source, the profiles and source inspection showed that the old global anchor query could select hidden App & Input content while Notifications was current. The hook also left `pm7PendingAnchor` intact when user scrolling stopped its observer. Manager rows were missing from its candidate list, and replacement lookup did not consistently follow the visible current-workspace node.

The one candidate adds current-workspace/visibility filtering, `.pm51-row` candidates, visible replacement lookup by id or tag/text, and pending-anchor release on wheel, touch or a non-row pointer action. It includes the required `systems_integration_source.py` `observeWidth` change from `assign(width);scheduleSyncHost();` to `assign(width);syncHost();`. Proto12's private pinned-base builder already contained that guarded direct-sync transformation; this iteration preserves it and adds the explicit authored-source checkpoint. It does not redesign the manager renderer or spacing.

Exploratory v1 sampled a position before bottom hydration settled and tracked a detached original node; its numeric drift is invalid. V2 did not resolve an anonymous heading and coerced missing geometry; its numbers and assertion of first-frame absence are not accepted. V3 follows the visible heading but predates manager-row coverage. All are retained with the superseding `m4-astra-probe-qualification.json`. The final folders retain their original `qualified` names, but the later clipping review supersedes that label. `m4-astra-visible-panel-analysis.json` derives the table from their recorded panel geometry. The inherited 10 px hidden-row observation and this probe's clipped fallback row cannot establish strict visible-anchor acceptance.

## Glass width diagnostic

A separate 1600 × 900, DPR 1 probe uses the Glass owner's after-paint sampling method (requestAnimationFrame then MessageChannel). In the baseline, the first painted Settings host still has a 515 px chat panel; on the second it has none. Settings width changes 751 → 1278 px and Accent moves 906.719 → 611.500 px: **295.219 px** of bounce. The deferred `scheduleSyncHost()` callback matches that width transition.

With the included direct-sync fix, chat width is already zero on both frames, Settings width is 1278 px on both, and Accent stays at 676.500 px: **0 px** first-to-second-frame bounce. The later roughly 4 px chapter arrival moves the scroller and Accent together. Traces and native screenshots are preserved.

This diagnostic compares `bundle-916-baseline` with the private M4 composition. It isolates the width sequence; it is not a complete same-source visual or performance comparison. Initial scroll differs (65 versus 0), and no navigation-parity or population-speed claim follows from it.

## Checkpoint and evidence

Raw root: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/`.

- Complete handoff manifest: `m4-astra-evidence-manifest.json`, SHA-256 **1b7f699a02423f9b4499db1ddbc9f923f096c9ce45952a2ec21c5fc311613039**. It binds source/artifact/driver copies, all final samples/screenshots, the offline visible-panel analysis and clipping qualification, Glass traces, exploratory evidence, and cleanup receipts.
- Source packet: `m4-astra-one-iteration-source/`. Includes old/new hooks, build/settings/NieR/motion checkpoints, explicit systems source, preparation/build scripts and receipts, fixture, CDP helper, final probe drivers and generated HTML.
- Baseline full HTML: `m4-astra-one-iteration-source/artifacts/m4-authorized-proto12.html`, SHA-256 `a24804ca08063d348751bfb24d9b90f70bd5684fdadf2a312c84cee885904911`.
- Failed full HTML: `m4-astra-one-iteration-source/artifacts/m4-astra-one-iteration.html`, SHA-256 `73876ff0567c2c3a51053e931141a5300aa14c553a3760d8f0f53c7cf63ad408`.
- Failed hooks: `m4-astra-one-iteration-source/m4-retained-hooks-astra-one.js`, SHA-256 `85ac7678766db4c2e62445a73cd0f478fff0172fc2d83ced14f822fe1c0a39ad`.
- Final raw records (see clipping qualification): `m4-astra-before-qualified/rows.json` and `m4-astra-after-qualified/rows.json`; their per-look files retain all geometry and state samples. `m4-one-iteration-result.json` beside this report summarizes them without raw captures.
- Offline correction: `m4-astra-visible-panel-analysis.py` and `.json` derive the visible panel-bottom displacement; `m4-astra-probe-qualification.json` supersedes earlier visibility/anchor claims.
- Glass: `m4-glass-entry-profile-v1/` and `m4-glass-entry-after-one/`, each with driver, frame samples, trace and settled screenshot.

For reproduction, use the frozen HTML/fixture/drivers in a new authorized Windows GPU session. The CDP helper expects the original runtime path and port 8879; restore its directory structure or explicitly adjust those paths. Set `CDP_META` to the new session metadata, `FILE` to the desired frozen HTML stem and invoke `node m4-focused-probe.mjs <new-unique-run-name>`. The driver refuses an existing evidence directory. Its CSS-only visibility selector must be corrected before claiming strict A1 acceptance; replay as-is only reproduces this diagnostic failure. Do not reuse the stopped/purged session or run the preparation script again as a new source iteration. The exact historic build commands/source hashes are in the build receipts; future integration must replay owner source seams and regenerate against then-current main, never copy this failed generated page.

## What remains and cleanup

Hand the retained-manager case to Opus: define anchor lifetime across manager replacement, end-space changes and the section tracker, then authorize the next implementation pass. Do not fall back to today's drift. Full all-ten-look A–F acceptance, P1000, system/app reduced motion, navigation/save, focus/hover, hardware films and M4 CPU acceptance were not run after the early rejection. None is claimed passed.

The separate bundle is also held: review branch `fix/pm7-perf-settings-bundle-20261014` at `0eb8712631`, tested source `fa8fd4235f` on `916059849e`. Its 1308 windows/654 matching snapshot pairs include repeatable slower cold cases; no bundle or reduced bundle qualifies for landing. See that branch's `reports/pm7-perf-settings-bundle-20261014/BUNDLE-RESULTS.md`.

Windows session `windows-37ea597f59c1` stopped gracefully, its SSH tunnel disconnected, and the shared session was purged. The verified task HTTP process on 8879 was terminated and the port has no listener. Timing/controller processes are gone. Local served prototypes, scripts, virtual environment and caches were removed after freezing the source packet and archiving historical evidence; only NEXT.md/PROGRESS.json handoff pointers remain in the runtime directory. `astra-cleanup-receipt.json` records this. The two unlanded, pushed review branches/worktrees remain for coordinator disposition. No Mac or P1000 session was used.
