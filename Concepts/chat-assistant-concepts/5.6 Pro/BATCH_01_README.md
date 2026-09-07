# Regular Plan demo + motion batch 01

## Delivered scope
Two small, distinct workflows now live in **Demo Studio → Guided Plan workflows**:

1. **Build a small Plan**: open V1 in its left tab, Build through the normal control, open pinned To-Dos, observe two dependent tasks complete, then Replay.
2. **Stop and revise**: start V1, stop its owner timer before revising, send feedback through the actual composer, observe V2 while V1 remains unchanged, inspect Markdown, then Replay.

They initialize explicit concept fixtures. Subsequent steps invoke existing visible controls; completion uses existing owner ticks, not a forced success state. They do not invoke providers or native Puppet Master.

## Repairs
- Ordinary Plan builds no longer generate an incorrect Goal-state receipt. They generate a typed, linked Plan receipt.
- A building Plan has an explicit Stop and revise action. Revision requires ready state and nonempty feedback.
- Revision consumes the actual composer message body, retains exact feedback, and does not let Plan-like feedback start a new unrelated workflow.
- Markdown Revision note depth is numeric instead of producing `31 Revision note`.
- Completed Plans retain their To-Do navigation. The demo guide ends with a working Replay action.

## Evidence
46 checks passed during/around the two recorded workflow executions, plus 18 nonrecorded supplemental checks. No page errors were recorded. Supplemental checks use real product controls after fixture setup, challenge repeated Build and Plan-like revision text, and measure the initial guide/transcript at 900 and 700 pixels.

The two 1280×900 H.264 recordings contain 632 and 512 frames, respectively: 10.533333 and 8.533333 seconds at an actual encoded `60/1` rate. FFmpeg sampled X11 at 60 Hz with passthrough timestamps, without interpolation or conversion of a lower-rate recording.

All 1,144 decoded frames were traversed in 40 consecutive indexed contact sheets, with five selected frames examined at native resolution. This is not a claim that every frame was individually inspected at native resolution. No blank-frame flash, capture-edge clipping, or unintended panel overlap was observed at the reviewed scales. The original capture attempt had a 10-pixel window-origin offset; it was superseded by correctly aligned final recordings.

Render timing is separate from recording rate. RAF telemetry has median intervals near 16.7 ms, but 6 intervals over 25 ms in the completion run and 2 in the revision run (maxima 33.4/33.5 ms). Therefore this is **not perfect 60 fresh rendered frames per second**. Identical decoded frames during intentional idle waits are normal. The evidence retains PTS and decoded-frame hashes rather than inferring rendering from the file's fps label.

## Limits and continuation
This batch does not close all Regular Plan requirements. It starts from ready fixtures; V2 retains feedback as a revision note, not an actual provider-generated rewrite. One captured default-theme viewport is not exhaustive layout coverage. The completed narrow Plan title wraps densely, though it remains visible. Historical stopped To-Dos are retained as prior-run information. Replay was tested outside the recording interval.

APR-016 and APR-018 remain globally open. Settings, protected working-animation sources, canonical Plans, and generated governance are unchanged. No new WorkNodes or production runtime were created. The prior whole-project gate failures were not repaired or certified.

The proposed next bounded batch is exact-version Plan scheduling, revision invalidation, and canceled-schedule non-dispatch. Its status is NOT STARTED. Resume from BATCH_01_CHECKPOINT.json and the final HTML hash, not prior unverified “19 workflows” claims.

## Installation
Merge this replacement's `Concepts` folder into the repository root. The ZIP also supplies matching root and Assistant delivery manifests. It deliberately contains no replacement Settings files. It is based on main `26dbc13b38fcab2fc4a38f6f6cd0d5464e2abd77`; inspect concurrent changes before replacing anything newer.

Open the standalone, choose Demo Studio, then Guided Plan workflows. The guide executes one visible step at a time; the controls remain usable manually. These are gallery-only actions, not product command registrations.

## Build/reproduction
The two generated HTML files come from build.py. The delivery is verified by clean extraction, removal of generated outputs, rebuild and complete-hash equality. See BUILD_AND_PACKAGE_VALIDATION.json.

Extract the evidence archive and run `python3 capture.py complete` and `python3 capture.py revise` for new captures, then `python3 frame_sheets.py` to create a new unreviewed frame index. The evidence includes its `repo/Concepts/...` sources. Requirements: Python Playwright, local Chromium, FFmpeg/ffprobe, and Xvfb. This recorded environment used Chromium 144.0.7559.96. Paths in the recorded logs intentionally preserve the original run. Do not reuse this visual review verdict for a later capture or changed build.

URL navigation is restricted in this harness, so exact HTML is loaded into a fresh about:blank context with set_content. Persistent-origin reload is not tested. The full committed residual Node suite was not completed in this selected checkout because a later Settings audit dependency was absent; it is not represented as passed.

No repository push or merge was made for this batch.
