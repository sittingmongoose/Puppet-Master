# Batch 3 — completed Review workflows + motion evidence

## Scope
Two completed Review examples now live in **Demo Studio → Guided Review workflows**. This is a cumulative Assistant-only update over supplied Batch 2, preserving Batch 1/2. Current main was checked at `010df9c7ff318b8e4fd7d321ba78986c44cceccb`; its separate onboarding merge is not touched. No repository write or push was performed.

**Single Agent Review:** configure one reviewer using the shared pickers, start, play recorded independent observations, inspect the read-only V1 report and frozen fixture-test evidence, switch Rich/Markdown, and download the same report.

**Multi-Pass Review:** configure three same-model slots with distinct attempts, play independent observations, normalize four raw observations into three candidates, retain duplicate origins and dissent, inspect evidence/agreement, and explicitly turn the two selected confirmed findings into pending To-Dos. Their source links return to the exact report finding. The uncertain suggestion is not converted.

The source fixture actually evaluates its literal filter function to produce the shown test output. Reviewer observations and adjudication are explicitly labeled recorded examples, not live model runs. No provider calls occur.

## Repairs and boundaries
- A read-only report now opens in the existing left editor host, reuses its tab identity, supports Rich/Markdown and a real Markdown download.
- Review's former request-only Create To-Dos route now calls the existing To-Do owner, preserving unrelated tasks byte-for-byte, validating the entire selection before append, recording finding/target lineage, and reusing task identities on replay. No task starts automatically.
- Required configuration is preserved for reruns; an existing report is not edited in place. Model and Persona catalogs are reused, not copied.
- Admission freezes a supplied target pack. Every initial slot has a unique pass identity and a common target hash with no initial peer material. Mismatched hashes, epochs, assignments and duplicate conflicting results are rejected.
- Additional negative testing found an attempt-currentness gap. Votes and finalization now require the actual current completed participant attempt, not just a known slot. Failed, timed-out, unavailable, canceled, waived, replaced and retried attempts cannot vote against an old pass.
- Dissent, duplicate origins, evidence references and uncertain findings are preserved. Single-reviewer output makes no peer corroboration claim.
- The guide provides hints rather than duplicating ordinary product action buttons. Closing it lets admitted work continue; cancellation stops the recorded replay clock; reset cannot resurrect callbacks. Interrupted playback offers an explicit fresh Replay.

The full new protocol is demonstrated for supplied target packs. Older generic fixture controls, native adapters, full partial-review/retry UX and production persistence are not certified. The demo fingerprint is explicitly noncryptographic, not a replacement native target-hash contract.

## Functional evidence on final bytes
- Review integration: **112 checks**.
- Lifecycle, source navigation, draft protection and narrow layouts: **27 checks**.
- Actual participant-attempt currentness counterexamples: **9 checks**.
- Batch 1 regression: **18 checks**.
- Batch 2 regression: **153 checks**.
- Assertions during the two final captured workflows: **39 checks**.

All listed checks passed and their reports identify this complete HTML SHA-256: `64c4b96d6ab1505ca6736195a4e9e4915cae3d1dd0f139bcdd4a607b18bb31ff`. No browser page errors were recorded in these suites. These are scoped assertions, not distinct fully certified features. The complete repository Node suite, TestPM generator and full governance gates were not run in this Assistant-only batch.

## Recording and visual review
| Recording | Decoded frames | Duration | Nominal rate | Worst measured browser interval | Intervals over 25 ms |
|---|---:|---:|---|---:|---:|
| multi | 1082 | 18.034 s | 60/1 | 49.9 ms | 1 |
| single | 692 | 11.534 s | 60/1 | 16.8 ms | 0 |

FFmpeg sampled X11 with a 60 Hz target and passthrough acquisition timestamps. No interpolation, generated frames, or lower-rate-to-60fps conversion was used. Exact average rates, PTS deltas and decoded-frame hashes are included; a nominal fps field alone is not motion proof. Repeated frames during idle waits are normal.

All **1774 decoded frames** were visually traversed in **38 consecutive indexed contact sheets**, with **13 selected frames** additionally inspected at native 1280x900 resolution. This is not individual native-resolution review of every frame. See `recordings/VISUAL_REVIEW.json` for precise frame ranges and observations. Browser render cadence and recording sampling cadence are separate measurements; longer rendering intervals remain a qualified motion finding, not a claimed perfect 60 fresh frames/second.

The same visible action traces were run without capture for comparison. Those measured maxima are in `BATCH_03_CHECKPOINT.json`; single samples do not establish a statistically isolated performance diagnosis or resolve Batch 2's different stalls.

The final Single Agent export includes Chromium's normal download notification over part of the top tab region; this browser chrome is retained and identified, not mistaken for a product toast. At 1280x900 the pinned Activity Detail also leaves an unused gutter beside the report; no clipping was observed, but width utilization is not declared perfect.

The first recording pilot had Chromium's fullscreen notice over the top of the configuration. It was rejected; the final harness waits for browser chrome to disappear before acquisition. The initial supplemental reset check also incorrectly invoked only the extension hook rather than the actual Reset button, and the capture pilot had an ambiguous locator. These harness errors are preserved as pilots, not attributed to the app or counted as passing final evidence. Earlier pre-fence recordings are superseded by final-byte captures.

## Delivery and reproduction
Merge the replacement ZIP's `Concepts` directory into the repository root and replace the supplied root/Assistant delivery manifests. Do not overwrite TestPMConcept or Settings from another package. This ZIP intentionally contains no Settings or onboarding files. Both HTML outputs are source-generated and must match a clean rebuild.

Run `python3 build.py` and `python3 build.py --check` in the Assistant directory. Extract the evidence package and run `python3 qa/verify.py`, `python3 qa/supplemental.py`, `python3 qa/vote_currentness.py`, `python3 qa/batch1-regression.py`, and `python3 qa/batch2-regression.py`. Requirements: installed Python Playwright and local Chromium. For captures also install/use local FFmpeg/ffprobe and Xvfb, then `python3 qa/capture.py single` or `multi`. `--no-capture` runs the same interaction trace without recording. `python3 qa/frame_sheets.py` creates a **new unreviewed** frame index; do not reuse the old verdict for changed source or new captures.

Ten protected working-animation source files are byte-identical to supplied Batch 2. Existing Settings, canonical Plans and governance are untouched. Manifests explicitly label retained out-of-scope rows as historical, not reverified evidence.

## Coverage and continuation
`reports/BATCH_03_COVERAGE.json` preserves 28 exact source rows and separates demonstrated clauses from remaining obligations. It does not rewrite the 551-row denominator or mark an entire mixed native/concept requirement passed by a fixture. APR-016 and APR-018 remain globally OPEN.

Next small batch: completed BrainStorm workflows, including one synthesized Deep Plan and hard-constraint disqualification with dissent. Existing Batch 2 presentation/cadence findings remain separately open; no global polish seal is implied.
