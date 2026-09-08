# BrainStorm demo + motion batch 04

## Delivered scope
Two explicit recorded examples under **Demo Studio → Guided BrainStorm workflows**:

1. **Explore and synthesize**: configure four core roles, receive blind independent proposals, normalize alternatives without losing their origins, follow two debate rounds and frozen evidence, inspect dissent and a calculated local query test, and explicitly synthesize one ready Deep Plan.
2. **A constraint outweighs the vote**: retain three hosted-index votes but disqualify that option under the frozen no-upload constraint; choose the eligible local option and preserve all three dissenting preferences verbatim in the exploration and Plan.

Both stories open real shared configuration/model/Persona controls and use validated concept ingress rather than force a finished state. The Plan is created by the existing Plan owner, remains in the same thread alongside its BrainStorm card, opens in a stable left tab, and does not build until the user explicitly asks. Replay opens a fresh configuration while retaining the previous completed result.

## Basis and boundaries
Published main was checked at `636b911c30442b628cbb5a319a02b5c5b1bb7a16`. The supplied Batch 3 Assistant matched published Git blob `979db91b3b047173b9bf078a6b70fb1799b855c0` exactly. All previous Assistant batches are preserved. No repository push or merge was made for this batch. Settings, TestPMConcept, new onboarding concepts, canonical Plans and generated governance are not changed or shipped here.

Current BrainStorm behavior is grounded in Collaborative_Workflows §8. Its current question limits (20 plus Grill Me 25) are not reverted to the older frozen packet's 15/10 values. The source-preserving coverage delta records that distinction and leaves unexecuted questions/provisioning/additive-role obligations open.

## Repairs and implementation
- New typed recorded inputs attach to the existing CollaborativeRun; there is no parallel run or Plan store.
- Proposal, debate, evidence, vote and synthesis ingress reject stale epochs, source hashes, assignments, attempts, conflicting repeats and incomplete phases.
- Candidate facts are checked against frozen hard constraints; vote totals cannot override disqualification. Dissent retains actual participant, reason, confidence and evidence.
- Proposal-origin preservation and option-specific vote totals avoid representing support for another option as abstention or unanimity.
- The resulting Plan carries decision, constraints, research references, ordered implementation, verification, risks, rollback, alternatives and exact dissent. Detailed source material remains in linked exploration/evidence tabs instead of being repeated as a wall of code in the Plan.
- Plan handoff is idempotent, refuses forged content and refuses to overwrite another current Plan silently.
- Pause, resume, cancel, reset, guide closure and replay use the actual lifecycle. The guide refreshes locally after disclosure without collapsing the open dissent panel.
- These additions apply to the new typed-input BrainStorm lane. Old seeded BrainStorm demonstrations are not globally rewritten or certified.

## Verification
Final frozen-build run: **186 new checks**, **319 prior-batch checks**, and **45 assertions in the two recorded traces**. Final run artifacts carry the full source hash and exit codes. No source changes are permitted between the frozen suite start and finish. Both equivalent no-recorder traces are retained separately for cadence comparison.

A separate explicit Build test takes the produced Deep Plan through the existing scoped compilation/To-Do path: three ordered scoped units and tasks, no repository WorkNodes or global readiness admission, and no automatic Build at synthesis.

The recorded scenarios include Replay. Narrow supplemental checks cover 900 and 700 pixel configuration/left-editor layouts; they are not full narrow-video or all-theme acceptance.

## Recording and visual review
Two 1280×900 recordings contain **2076 decoded frames across 34.60 seconds**. FFmpeg samples X11 at a 60 Hz target, retains acquisition timestamps and performs no interpolation or lower-rate-to-60 conversion.

Every frame was traversed in **44 consecutive indexed contact sheets**. **12 selected frames** were inspected at native size. This does not claim that every frame was individually inspected at full resolution. See VISUAL_REVIEW.json for actual findings and frame ranges.

- synthesis.mp4: 993 frames, 16.550 seconds, nominal `60/1`, average `9930000/165503`; RAF median 16.70 ms, max 150.00 ms, 10 intervals above 25 ms. Same trace without recording: max 133.30 ms.
- constraint.mp4: 1083 frames, 18.050 seconds, nominal `60/1`, average `21660000/361007`; RAF median 16.70 ms, max 133.40 ms, 11 intervals above 25 ms. Same trace without recording: max 133.30 ms.

An encoded sampling rate is not proof of 60 fresh renders per second. These Linux/Xvfb measurements are not a benchmark of native Puppet Master or the user's hardware. Prior batches' open performance/presentation findings remain separately tracked.

## Install and reproduce
Merge the replacement ZIP's `Concepts` folder into the repo root, plus the supplied root replacement manifest. Do not put the Concepts directory inside the existing Concepts directory. This is a cumulative Assistant-only package; there are no replacement Settings/onboarding files.

The two HTML outputs come from `build.py`; do not edit them directly. A clean extraction test deletes them, rebuilds, and compares complete hashes. The direct standalone is byte-identical to both outputs inside the ZIP.

The existing builder preserves CRLF in generated HTML. Plain `git diff --check` flags those line endings; it is not claimed green. The explicit CRLF-aware whitespace check and the JS/CSS/Python source-only whitespace check pass without normalizing the generated output or weakening its source checks. Their actual commands/results are retained in the package validation.

Extract the evidence ZIP to a fresh directory. It includes `repo/Concepts/...`, `qa/verify.py`, `qa/supplemental.py`, `qa/attempt_currentness.py`, `qa/handoff_build.py`, the regression scripts, `qa/capture.py` and `qa/frame_sheets.py`. Python Playwright, Chromium, Xvfb, FFmpeg/ffprobe and Pillow are required. This environment used Chromium 144.0.7559.96. Run `python qa/capture.py synthesis` and `python qa/capture.py constraint`, then `python qa/frame_sheets.py`. New captures begin unreviewed; never reuse this visual verdict for changed bytes or new recordings.

`BATCH_04_CHECKPOINT.json` is the continuation state. `BATCH_04_COVERAGE_DELTA.json` preserves original requirement rows and exact dispositions. The full 551-row/67-group demo matrix, APR-016 and APR-018 remain globally open. The next bounded batch is completed Crew delegation and explicit Crew Auto admission.
