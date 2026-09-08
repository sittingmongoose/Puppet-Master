# Crew demo + motion batch 05

## Delivered scope
Two gallery-only workflows under **Demo Studio → Guided Crew workflows**:

**Delegate and verify.** Configure three roles, open the assignment document, run local calculations, inspect the output contract and frozen activity, and export the exact verified CSV. Two independent assignments are eligible together, with integration pending until both results validate. A configured concurrency of one instead completes sequentially. Default requested concurrency is three; the supplied capacity limits it to two.

**Crew Auto knows when to help.** Explicitly commit the policy, test a small request and an explicit single-agent request (neither creates a Crew, failed card or Usage), then evaluate independent work. The admitted Crew uses the stored roster/policy revision and the same output verification and export path. Disabling retains the policy and prevents new admission. These are typed example requests, not a natural-language complexity classifier.

The example ends in a CSV artifact, not a new Goal or To-Do. Local calculations generate actual output from the frozen two-record collection. They do not modify project files or call providers. “Simultaneous” describes admitted assignment state in this single-browser demonstration, not physically parallel remote workers.

## Repairs
The shared collaboration store and participant outcome owner are reused. Notes and tool-success booleans cannot complete these typed assignments: exact output structure/content, source, assignment revision and current attempt must match. Missing dependencies remain Pending. Current required outputs precede one idempotent result artifact.

Start and Auto admission reject conflicting reused request identities. A canceled configuration starts nothing and can be reopened. Real hover items open the selected Crew in the pinned Activity panel, with exact participant transcript rows; the bar now reports its actual Crew count instead of the old seeded Crew 0 projection. Completed work opens a stable editor tab with a real CSV download and explicit Run another Crew configuration. A fresh rerun can complete through the same controls even after its prior guide was closed.

Testing found and repaired both a pause/resume playback envelope bug and the one-at-a-time playback bug. Visual inspection also caught source disclosure collapsing during Export; per-run view state now preserves it and open output-contract disclosures across live updates. Resume issues fresh stage requests but does not admit a saved pre-pause result. Cancel and Reset fence later playback. Closing the guide leaves already-admitted work running. Prior pilot failures are retained separately from final results.

## Functional verification
151 new checks, 505 prior-batch checks, and 41 assertions in the final captured traces passed on raw HTML SHA-256 `96ddadb361b8c3f1ca80f859d82c91fd6ffe9f232317cf14fcc7eaadd244da73`. No page errors were recorded in these completed runs. The frozen runner preserves every command/exit code and verifies source bytes did not change between execution steps. Matching no-recorder traces were executed separately for cadence comparison and are not counted as extra unique acceptance scenarios.

New negative cases cover source and parent-context changes, unknown/stale participant attempts, missing/wrong evidence, free-text completion bypass, premature finalization, duplicate claim/result/Start/admission, unavailable model selections, invalid policy facts/capacity, concurrency limits, cancellation, pause/resume and reset. Bounded 900/700-width tests cover the configuration footer and completed document/guide without horizontal overflow.

## Recording and visual review
| Trace | Duration | Frames | Maximum RAF interval | Same trace, no recorder |
|---|---:|---:|---:|---:|
| B05-CREW-AUTO | 15.53 s | 932 | 33.4 ms | 33.4 ms |
| B05-CREW-DELEGATION | 12.53 s | 752 | 33.4 ms | 33.4 ms |

FFmpeg acquired X11 at a 60-Hz target with passthrough timestamps, no interpolation and no conversion of a lower-rate movie. Nominal and measured average rates, full PTS, decoded frame hashes and browser timing are retained. Identical idle frames are not evidence of dropped rendering; a file's fps label is not proof of 60 fresh browser renders every second. The Auto file reports a nominal `r_frame_rate` of `240/1`, but its preserved acquisition timestamps and measured average are approximately 60 fps, not 240 fps. Its PTS intervals range from 11.3 to 22.05 ms; delegation ranges from 13.383 to 19.934 ms. These variable timing facts are retained, not hidden by resampling.

All 1684 decoded frames were traversed in 36 consecutive indexed contact sheets, and 16 selected frames were inspected at native 1280×900. `recordings/VISUAL_REVIEW.json` binds notes to actual frame and video hashes. This is not individual native-resolution inspection of every frame. Captures include configuration confirmation, work, contract/source disclosure, actual export and Replay; initialization/gallery navigation and shared picker interaction have separate functional evidence, not recording coverage.

Known findings remain explicit in that visual report and checkpoint; there is no blanket polish or uniform-60-fresh-fps acceptance. Earlier Batch 2–4 gutter, toast/bar and rendering findings remain open unless explicitly superseded.

## Delivery and boundaries
This Assistant-only package is cumulative through Batch 4 and based on main `5d264c847e4e6a096523349986719a7adb09701a`. No repository push is made. Merge its `Concepts` folder into the repo root and replace the supplied root replacement manifest; do not nest it inside Concepts. It does not ship or overwrite TestPMConcept, Settings, onboarding, Plans or governance. Out-of-scope manifest rows are historical, explicitly not reverified here.

Both generated HTML files are built from source by `build.py`. The delivery validator deletes them after clean extraction, rebuilds, compares full hashes and checks protected working sources. No standalone font files are distributed. See `BUILD_AND_PACKAGE_VALIDATION.json` in the evidence package.

## Reproduction and continuation
Extract the evidence ZIP. Requirements are Python with Playwright and Pillow, local Chromium, FFmpeg/ffprobe and Xvfb. Run `python qa/verify.py`, `python qa/supplemental.py`, and the named prior-regression scripts, then `python qa/capture.py delegation` / `python qa/capture.py auto`. Use `--no-capture` for the corresponding rendering baseline. `python qa/frame_sheets.py` generates a NEW unreviewed frame index: it does not recreate a visual inspection verdict.

Read `BATCH_05_CHECKPOINT.json` and `BATCH_05_COVERAGE_DELTA.json` before continuing. Original source rows are retained exactly; only bounded subclauses gain evidence. APR-016/018 remain globally open. The next proposed batch is Chat Room discussion plus explicit promotion, with the existing performance/presentation findings carried forward.

## Limitations
- Local JavaScript collection/CSV calculation, not live model calls, native project writes or physically parallel agent workers.
- Three fixed role/output contracts and a parent-assistant coordinator. Generic rosters, optional specialists, Build With Crew Plan/ToDo binding and other coordinators are not certified.
- Crew Auto request complexity, explicit-single preference, independent-work facts and capacity are supplied example inputs; no natural-language task decomposition or real orchestrator probing is claimed.
- Policy commit changes in-memory concept Settings state; it is not proof of durable project Settings, reload or cross-machine recovery.
- Old seeded Crew/free-text completion paths outside the new typed examples remain outside this repair.
- One recorded default-theme 1280x900 viewport plus bounded 900/700 layout tests, not all theme/width/working-style combinations.
- All consecutive decoded frames were inspected in indexed contact sheets plus selected native frames; not every frame individually at native resolution.
- Capture targets 60 Hz and retains actual PTS. Browser rendering gaps and inherited presentation debt remain separate open findings.
- Full repository governance, full upstream PM7/Settings build and native runtime suites were not run. No Plans, Settings, onboarding or governance files are replaced.
