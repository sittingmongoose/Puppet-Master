# Batch 6 — selective layout rollback and Chat Room

## Status and source
Functional scope verified; layout-only rollback source-built; bounded recordings reviewed. This does not close the full 551-row demo matrix, all-feature motion acceptance or native runtime readiness.

Starting published main: `28d5fe439257f8dbdc297ae311d6769a6476ab01`. GitHub main was rechecked at the end and remains at that commit. This delivery is local; no product source push or merge was made. A source-snapshot workflow branch from the prior attempt exists independently.

Assistant SHA-256: `8e23cfe2fbf30041111cb7dc6fc3e73dfa5407c87bbc0c5510bba1bf0a82c3e4`.
Settings SHA-256: `66cd9ca232ef6017c45ce93e0ab2dcd65a44923f95ea24b580b94f53187ddf30`.

## Selective rollback
The user withdrew only layout/style changes made because of the reference video. The rollback removes the video-inspired flat-row, borderless-section and forced-single-column overrides from narrow-review.css and assistant_narrow_source.css, revealing the previous native card/grid presentation. The live Context/BSD projection retains its current data and controls and uses native metric cards rather than the reference-derived list. It is not an old whole-page restore.

Preserved: all 892 settings and 21 actual manager workspaces; all 29 Settings HTML script elements byte-for-byte (26 JavaScript, 3 JSON); current tour/onboarding code; new managers and controls; model and Persona pickers; option help; footer insets; concise content/disclosures; no decorative left stripes; pinned Activity navigation; floating Activity Bar; in-flow Context Lens; History/internal-note fixes; diff colors; Step Rail Simple on its existing preference; Batches1–5. All ten protected working-animation sources remain unchanged.

All 21 actual manager workspaces were measured at 900 and 700px (42 positive-width cases) with no horizontal overflow. There are 52 scoped layout assertions across the two reports, not 52 independently implemented features. Settings/Activity/Context screenshots were inspected; this is not a recording campaign across every manager.

## Chat Room workflow A — Discuss, then choose an action
Open Demo Studio -> Guided Chat Room workflows -> Discuss, then choose an action. Configure three participants using the existing shared pickers. Ask Everyone to receive one reply per participant in the first moderated round. Message the room through the ordinary composer, then choose Next Round. Replies link to that exact shared user message. Summarize and finish: no Plan, Goal, To-Do or execution is created automatically. Select the Engineering action about keeping '/' literal in editable inputs and explicitly create a To-Do. Open the actual pending task in pinned Activity Detail, follow Open source message back to its original record, export the transcript and Replay into a fresh configuration.

## Chat Room workflow B — Turn a conclusion into a Plan
Open the second guide, configured for Ask Everyone Once. Complete the three replies, summarize and finish. Select the moderator's conclusion and explicitly Create Plan. One ready Standard Plan opens in a stable left document tab with normal controls and source backlink. It does not Build itself or create tasks automatically. Return to the source discussion, export and Replay. A separate supplemental test invokes the Plan's real explicit Build control and observes its To-Do execution through completion.

The replies and moderator summary are declared recorded example inputs, not live model calls or generated research. Summarize validates the current discussion but does not use an AI to generate new wording. The two fixtures cover moderated/two rounds and Ask Everyone Once/one round with three members; they do not certify every supported production turn policy or roster size. Existing unsupported fixture configurations refuse admission rather than fake results.

## Functional corrections
- Reuse the existing collaboration run, participants, messages, card/panel and configuration surfaces. Frozen source, definition revision, current participant attempt, reply target and turn order are validated before accepting a reply.
- Preserve addressed delivery exactly once. The user's ordinary message is one shared object referenced by the main and room projections. Discussion remains separate from Crew execution.
- Prioritize an active room destination before interpreting Plan/Goal wording or slash-like text as a new assistant workflow. Ended/stale destinations retain text instead of silently clearing or redirecting it.
- Explicit Plan/To-Do promotions reuse their respective owners, validate the selected source message and preserve run/message/participant lineage. Idempotent promotion returns the original result; another current Plan is not silently overwritten.
- Pause/resume fences stale attempts, cancellation/reset fence late callbacks, summaries invalidate on a new user question, and reconfiguration opens a new draft without rewriting old attribution.
- Use canonical `todo` Activity domain and pinned presentation for promoted tasks, not a fallback from the incorrect plural key.

## Executed verification
107 new Chat Room checks, 656 prior-batch regression checks, 52 scoped layout checks and 37 assertions in the final recordings passed. Final browser reports contain no page errors. The complete HTML SHA-256 is checked in each functional/regression/recording report.

One prior scheduling-suite attempt timed out during Page.set_content while waiting for external-resource load. The final harness waits for DOMContentLoaded and then the unchanged actual app boot predicate; all153 assertions passed. The failed load log is retained separately. The regression orchestrator was also corrected to propagate nested nonzero exits rather than treating successful orchestration as passing tests. Actual individual results—not the older aggregate exit0—support the totals.

## Recordings and visual review
- Discussion: 992 frames, 16.533650 seconds, worst recorded RAF interval50ms.
- Plan: 692 frames, approximately11.53 seconds, worst RAF interval33.4ms.
- Total: 1,684 consecutive frames, 36 contact sheets, 10 selected native-resolution frames.

Capture uses X11 acquisition at a60Hz target, H.264 at1280x900, passthrough acquisition timestamps, no interpolation. Average encoded rates are approximately60fps. All frames were traversed in indexed320x225 contact-sheet tiles; selected frames were additionally inspected at native resolution. This is not inspection of every frame individually at full native resolution. PTS/frame hashes, capture commands, browser events and RAF samples are retained separately.

Motion is not perfectly continuous60fps: the discussion has21 intervals over25ms and the Plan trace19. Matching non-recorded traces also reach roughly33.4ms. The unused chat gutter and floating-pill overlap at a non-bottom Plan-card scroll position remain open. Chromium's Download started popup after export is browser chrome, not an application toast. Earlier batches' unresolved presentation/performance findings remain open.

## Settings generator boundary
The old dedicated build_testpm_assistant_settings.py does not reproduce the currently published TestPMConcept; its older checkpoint would discard newer changes. This batch adds build_testpm_layout_b06.py with an immutable exact-current published checkpoint. It changes only style block pm50-manager-layout, preserving every script and the inventory. The old builder's failed baseline --check is retained; the full upstream PM7 pipeline is not claimed green.

## Build and installation
Merge the supplied Concepts folder into the repository root and replace the supplied REPLACEMENT_MANIFEST.json. Do not put Concepts inside Concepts. The package preserves the real repository names and includes cumulative Assistant sources plus only the changed/new Settings rollback inputs and its generated output. TestAstraPmConcept, TestProPmConcept and other onboarding/concept source files are not replaced.

```sh
python3 "Concepts/chat-assistant-concepts/5.6 Pro/build.py"
python3 "Concepts/chat-assistant-concepts/5.6 Pro/build.py" --check
python3 Concepts/pm7-tools/build_testpm_layout_b06.py
python3 Concepts/pm7-tools/build_testpm_layout_b06.py --check
```

Clean-extraction validation deletes all three generated HTML outputs, rebuilds both concepts, and compares complete hashes. Final validation results are included in the evidence archive. No standalone font files are distributed.

## Reproduction and continuation
The evidence archive includes the final replacement source under repo/ plus qa/ scripts and final logs. Run python3 qa/verify.py, python3 qa/supplemental.py, and python3 qa/run_prior.py in the extracted evidence directory. Requires Python Playwright, local Chromium, FFmpeg/ffprobe and Xvfb. qa/capture.py discussion and qa/capture.py plan regenerate unreviewed recordings; never reuse the old visual verdict on new bytes. Browser URL navigation is restricted in this environment, so a fresh about:blank page loads exact HTML via set_content; persistent-origin reload is not tested.

A separate focused Plans follow-through packet supersedes only the reference-derived visual prescription while preserving all other cumulative requirements. Canonical Plans, index, governance, WorkNodes and native code are not modified by this concept delivery.

Next bounded batch: Teach/taught-memory capture and explicit correction through supersession. Status NOT_STARTED. Full matrix/API/native/persistence/promotion-to-Goal-or-artifact/other-turn-policy coverage and comprehensive Settings motion remain open.
