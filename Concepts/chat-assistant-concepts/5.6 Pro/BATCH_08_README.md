# Batch 8 — Automatic Assistant memory and scoped polish repairs

## Delivery and authority

This is a completed bounded **concept** delivery, not native runtime or all-feature certification. Batches 1–7 and the selective reference-video layout rollback are retained. Settings, onboarding, canonical Plans and governance are not replaced. No product commit or push was made in this batch.

GitHub `main` was checked at the start and finish: `14e300865cb9d560ffc88fcd6a491d9f28d5bb91`. The baseline is the surviving Batch 7 package, not purported interrupted Batch 8 source. Its published HTML Git blob is `76525b36f4f75dd776660517fe0506701d61578e` and raw SHA-256 is `ca04b923102f087301f133f3c92c385fe049723c3bb35803c2f1136adcb13284`.

The current memory owner is `Plans/assistant-memory-subsystem.md`, Git blob `b50655e1db05a26ab664a471f889dd530ee29e81`. Relevant contracts are §5 verification/triggers and AMS-044/045 claim support/currentness, §6 summary-only eligibility, and the independent taught-memory owner. The concept does not elevate a local fixture or successful JavaScript check into a production contract. Historical attached ledger/process packets do not replace these current product owners.

Final HTML SHA-256:
`182c1786bd26138b7fe9c3ff4f436b12cfb1a3142beb42ebfcce9abddbd5a080`

See `FINAL_SOURCE_PIN.json`, `SOURCE_DIFF.json`, and `BUILD_AND_PACKAGE_VALIDATION.json` for full final identities, the exact source delta, and clean-extraction results.

## Installation

Merge the replacement ZIP's `Concepts` folder into the repository root, replacing the supplied Assistant files. Replace the supplied root `REPLACEMENT_MANIFEST.json`. Do not put `Concepts` inside the existing `Concepts` folder. The Assistant folder's `DELIVERY_MANIFEST.json` contains the same current delivered-file inventory. Neither manifest includes a self-hash.

The direct HTML preview is identical to both generated HTML files in the ZIP. The replacement does not include `TestPMConcept.html`, its Settings sources, TestAstraPmConcept, TestProPmConcept, Plans, generated governance, standalone font files, or recordings. Keep the evidence ZIP separate from the product source folder.

Open **Demo Studio → Guided automatic memory workflows** for the two new workflows.

## Workflow A — Remember only the supported result

A local label-order fixture evaluates three cases: leading whitespace, case-independent order, and preserving the original input. Running a check is not yet a completed Assistant run. Completing the local run evaluates the milestone before the run boundary and records at most one compact gist. Repeating the same result does not create duplicates.

The only positive claim proved by this evaluator is **“Local label-order checks passed (3/3 cases).”** Its scope is the actual three cases, not production performance or arbitrary natural-language correctness. Gist Review shows its claims, small references, verification state, source evidence and history. The next-context preview includes only the eligible summary, never the expanded source/case details.

Changing the example source makes the old claim Unverified and removes it from automatic eligibility. Its original source and evidence remain inspectable; rechecking cannot silently bless obsolete evidence. Export returns an actual JSON history download. Replay creates a fresh example identity and retains old records. The normal Gist Review entry defaults to Unverified; explicitly opening a particular newly verified record shows that selected record.

## Workflow B — Teaching stays under your control

The existing Teach form explicitly captures project-scoped, user-locked guidance:

> Edit the source, rebuild generated output, and compare it before publishing.

A subsequent automatic proposal suggests skipping the comparison. That proposal is held as Unverified; it cannot edit, supersede, or become an automatically eligible replacement for locked teaching. “Review teaching correction” opens the existing Teach correction form with the exact original instruction, not the unsafe suggestion.

An explicit user correction adds the label-order checks. V2 becomes current; V1 remains unchanged in history. The preview keeps automatic memory and explicit teaching separate. It includes the current allowed teaching and excludes the unverified proposal. Scope checks prevent another thread from seeing a thread-scoped teaching proposal. Repeated or stale actions are challenged by the functional tests.

The proposal and its teaching target are demonstration inputs. This is not a generic contradiction detector or semantic evaluation service, and the user-entered corrected text is not described as a model-produced result.

## Functional changes

The former six-user-message trigger and unconditional “Mark verified” shortcut are removed from the active memory path. Ordinary final Assistant text now records an unverified run-boundary candidate; explicit local owner events demonstrate milestone-before-boundary handling. The hook is not yet wired to every legacy asynchronous workflow.

Verification checks per-claim support, exact scope, resolvability, source/evidence fingerprints and currentness. Unknown scope, unsupported text, wrong or missing references, changed source, and discarded records cannot pass merely because a file/test record exists. Pinning does not grant verification. Actual changed-source invalidation retains explainable history.

Deduplication's exact payload key is held privately in the in-memory registry. The gist stores bounded fingerprints and references rather than accidentally embedding raw test cases or source content in metadata. These local fingerprints are not cryptographic security claims; final source and artifact identities use SHA-256.

Expanded gist evidence now survives Pin, source invalidation and Recheck. An earlier recording exposed that collapse defect; it was repaired before the final captures and regressions. A repeated local-check receipt caption was also removed.

## Open-issue repairs

| Issue | Result and boundary |
|---|---|
| Closed History still reserved 200 pixels | Repaired. Closed mode now clears its stale DOM pinned state; actual pinned History still reserves its visible width. |
| Completed Plan title squeezed beside actions | Repaired. Title has its own full-width group; actions occupy the following group. Verified in the actual completed Plan at 1280, 900 and 700 pixels. |
| Long message-menu tooltip repeats visible copy | Repaired for enabled More-menu choices. The visible explanation, accessible label, and disabled reasons remain. |
| Application notification covers composer | Moved to the top-right stack. Composer and send/model/Persona controls stay clear. Upper content may still be transiently overlaid. |
| Repeated render/layout measurements | Improved with cached intrinsic chrome measurements, a persistent/coalesced ResizeObserver, and conservative unchanged-DOM reuse. Form controls and preserved working subtrees are excluded from the shortcut. |
| Floating Activity pill obscures controls | Partially mitigated. Settled-bottom and keyboard-focused controls are scrolled clear; the intentionally floating pill can still overlap arbitrary mid-scroll content. No global removal of that design is claimed. |

The layouts remain the native card/section treatment restored in Batch 6. No reference-video flattening, forced single-column manager layout, or decorative left stripes are reintroduced. The ten protected working-animation source files remain byte-identical to Batch 7. Orbit and Step Rail Simple were checked for DOM identity/count, not recertified across every animation.

## Final-build functional verification

| Executed set | Passing assertions |
|---|---:|
| Automatic memory integration/counterexamples | 76 |
| Scoped polish/layout/working identity | 52 |
| Prior-batch regression scripts (15 scripts, all exit 0) | 886 |
| Assertions in the two final recorded traces | 46 |
| Matching traces without recording | 44 |

The final reports have no browser page errors. All 46 top-level JavaScript modules pass `node --check`. The prior-batch tests exercise Plan build/revision, scheduling, Review, BrainStorm, Crew, Chat Room and Teach, including their retained negative cases. They do not certify native providers or persistence.

The 52 polish checks include the completed Plan at three widths, eight themes at three widths for cached chrome fitting, tooltip/notification/History geometry, selected working-component identity and cross-thread teaching-proposal exclusion. They are not a complete all-screen cross-product of themes, widths and features.

## Performance — improvements and remaining limits

A matched warm-render comparison used three fresh pages per build, alternating baseline/final order, with 90 retained samples per build after warmup:

| Synchronous application render | Batch 7 | Batch 8 |
|---|---:|---:|
| Median | 10.55 ms | 6.70 ms |
| 95th percentile | 13.70 ms | 9.50 ms |
| Maximum | 21.60 ms | 13.50 ms |

This compares the same Teach scene and is not a whole-product GPU benchmark. The samples and method are retained in `qa/RENDER_COMPARISON.json` and `qa/performance.py`.

A separate one-sample-per-build **completed BrainStorm Replay** probe shows why continuous 60 fps remains open. Synchronous replay handling decreased from 29.5 to 18.6 ms, but the largest requestAnimationFrame interval was 33.4 ms in that baseline sample and **50.1 ms** in the final sample. This small probe is not statistically conclusive, but it prevents claiming that all prior motion stalls are fixed. Both builds preserved the completed result and opened fresh configuration. See `qa/REPLAY_CADENCE.json`.

## Final recording and visual evidence

| Recording | Duration | Decoded frames | Largest recorded RAF interval |
|---|---:|---:|---:|
| Verified result / source invalidation | 12.033600 s | 722 | approximately 16.8 ms |
| Locked teaching / explicit correction | 12.533583 s | 752 | approximately 16.8 ms |
| Total | 24.567183 s | 1,474 | |

FFmpeg sampled X11 at a 60 Hz target, retained acquisition timestamps, and encoded without interpolation or conversion from a lower-rate recording. The actual file averages are approximately 60 fps; timestamp intervals include acquisition jitter. RequestAnimationFrame measurements are scheduling telemetry, not proof of fresh GPU/display painting for every sample. Identical frames during intentional idle time are normal.

All **1,474 consecutive decoded frames** were visually traversed in **32 indexed contact sheets** at 320×225 tile size. **Twelve selected frames** were additionally inspected at native 1280×900. No claim is made that every frame was inspected individually at native resolution. The hashes and reviewed frame ranges are in `FRAME_REVIEW_INDEX.json` and `NATIVE_REVIEW.json`; original PTS and decoded frame hashes are included.

The final views retain readable modal footers and source/evidence disclosures. Recheck no longer collapses evidence; export preserves it. Replay cleanly opens a fresh fixture. Chromium's fullscreen download notification temporarily covers the top strip after the actual JSON download; the evidence identifies it as browser chrome, not an application toast. The new scenarios do not exercise every historical panel animation.

## Build and reproduction

The replacement was extracted into a clean directory; both generated HTML outputs were deleted, rebuilt via `python3 build.py`, and checked via `python3 build.py --check`. Both rebuilt outputs must match the final standalone bytes. Every listed replacement file is checked against the current manifests, and ZIP integrity is checked before delivery. See `BUILD_AND_PACKAGE_VALIDATION.json` for actual commands and complete identities.

The evidence archive contains `repo/`, the final test scripts under `qa/`, current logs, scope/coverage documents, before/after screenshots, capture code and frame-review data. Run `python3 qa/memory_verify.py` and `python3 qa/polish_verify.py` from the extracted evidence; prior-regression scripts are individually runnable. `python3 qa/capture_memory.py verified` and `python3 qa/capture_memory.py locked` create **new, initially unreviewed** recordings. Use each script's arguments/environment options as documented in its source; `qa/frame_sheets.py` builds a fresh frame index whose review flags must not be copied from this run.

Requirements for these harnesses are Python Playwright, local Chromium (recorded version 144.0.7559.96), Node, Pillow, FFmpeg/ffprobe and Xvfb. The browser loads exact HTML into a fresh about:blank context using set_content because URL navigation is restricted in this environment. Persistent-origin reload is not tested. Changed renderer, source, fonts, capture settings or viewport invalidate prior visual acceptance.

`qa/finalize_delivery.py` is the packaging audit helper; it also expects the original Batch 7 replacement ZIP for protected-file comparison and is not required to run the delivered concept. It must never mark a new frame sheet reviewed. `qa/finish_review_records.py` records this completed review and is not an automatic visual-review tool; do not apply its recorded verdicts to new recordings.

## Retained source coverage and continuation

`BATCH_08_COVERAGE_DELTA.json` carries exact source records and hashes for 13 affected rows from the retained 551-row census. They remain **PARTIAL_CONCEPT_EVIDENCE** where their broader contracts are not proved. APR-016 and APR-018 remain globally OPEN. Existing historical checkpoints are retained, not restamped as newly certified.

Still open: full feature-to-multiple-demo coverage; all-feature motion acceptance; remaining complex replay stalls; arbitrary mid-scroll pill occlusion; every legacy asynchronous boundary hook; full Gist Review filtering/maintenance; durable redb storage and restart; Tantivy/USearch; production tokenizer/capsule assembly and provider dispatch; general semantic evidence/conflict detection; native runtime/readiness and unrelated repository-wide gates.

The next bounded feature checkpoint is **Debug investigation from a frozen target and baseline through reproduction, a checked repair, and cleanup**, carrying forward the exact open performance/overlay findings. No new scope or layout decision is required from the user.
