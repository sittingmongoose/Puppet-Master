# Independent critique — ER12 A3-02-control

## Review boundary

Reviewed the finalized brief, the exact released copy `revealed-plan.md`, investigator `discovery.md`, `draft.md`, `source-map.json`, and its `sources/index.md`. The brief, discovery, draft, source map, and released plan hashes match the critic freeze (brief `64d7c999…d712e`; discovery `756c86b1…9734`; draft `1ae0b7ef…1b38`; source map `5bde84fe…911a`; plan `b9774576…b79`). The revealed plan was released at 2026-10-10T04:56:38.164Z. This review does not use the investigator's conclusions as proof: I independently re-opened governing W3C and vendor/implementation sources recorded in my source map.

No Chrome/Safari runtime, permission prompt, recorder, microphone, playback, or download was exercised. The report distinguishes those proposed checks from source review. The source evidence supports mechanism/history claims, not a current browser/OS support matrix.

## Assessment

The revised plan preserves the brief’s component-only scope and negative constraints. It corrects the hard-coded WebM assumption, callback-count clock, automatic-WAV assumption, and MIME-probe overclaim. Its lifecycle, three format-success gates, native/Worklet comparison, chunk assembly, bounded memory proposal, history examples, and proposed-versus-executed distinction are substantially complete. I found no fabricated browser result and no blanket current Safari/Chrome capability claim.

| Brief clause | Assessment | Locator |
|---|---|---|
| R1 permission, lifecycle, ended tracks, cleanup, explicit errors | Covered. Includes late permission resolution after Cancel, mute/unmute, track end, partial results, and teardown. | `draft.md` §R1, items 1–7 (lines 28–34) |
| R2 negotiation/fallback and separate success stages | Covered. Candidate strings are explicitly proposals; preflight, construction/start, and completed capture/preview/download are separate. | §R2 (lines 36–49) |
| R3 native vs Worklet mechanism, encoding, buffering, cost | Covered at mechanism level; Worklet is correctly not treated as a WAV encoder or container. | §R3 (lines 51–63) |
| R4 event timing and assembly | Chunk timing/assembly is accurate and supported. The five-minute enforcement contract still needs a product boundary; see F1. | §R4 (lines 65–69) |
| R5 released implementation/history and scoped claims | Strong and bounded overall. The Safari 16 issue’s final resolution is omitted; see F3. | §R5, table (lines 71–84) |
| R6 bounded proposed matrix and honest execution report | Six finite groups and a finite candidate list; browser work is clearly proposed, not run. Timing pass criteria inherit F1. | §R6 (lines 86–99) |

## Findings

### F1 — Material incomplete — five-minute limit can overrun

**Evidence and locator:** The brief asks for one memo “up to five minutes” (brief line 6) and rules out a promise based only on callback counts (line 18). The draft says to stop at 300,000 ms of active time and to re-check on timers/events/foreground return (§R4, lines 67–68). It acknowledges delayed callbacks and refuses a hard wall-clock promise through sleep (§R1 item 4, line 31; §R6 timing row, line 92), but the proposed stop still depends on page code running. A frozen/suspended page or a blocked main thread can delay the stop request while MediaRecorder continues; there is no stated tolerated overrun, strict-vs-best-effort contract, or pass threshold for the timing test.

**Why it matters:** This is a boundary in the user's duration requirement, not a flaw in using a monotonic timer for display. The plan should leave the five-minute guarantee unresolved until the owner defines whether it is a best-effort active-time limit or a strict maximum and the validation has a matching pass criterion. Source-only research cannot establish an exact overrun bound.

### F2 — Honestly unresolved external input — hidden-page behavior

**Evidence and locator:** The brief says the page may be backgrounded and prohibits a background-surveillance feature (brief lines 8 and 18). The draft chooses to pause/disable on every `visibilitychange` to hidden and require an explicit foreground resume (§R1 item 4, line 31), then lists “foreground-only pause policy versus a consciously authorized background recording mode” as an owner decision (§Optional improvements and owner decisions, lines 101–103).

**Assessment:** The conservative behavior is explicit and privacy-preserving, but the brief does not equate incidental tab/app backgrounding during a user-started memo with surveillance. The revised draft correctly exposes this as an owner decision rather than presenting it as a settled requirement. It remains a visible capture behavior to adjudicate before final implementation; this critique does not prescribe which choice to make.

### F3 — Minor locator/history omission — WebKit issue 258567

**Evidence and locator:** The draft’s §R5 row for S8 (line 79) reports the Safari 16.4/16.5.1 setup, 96 kHz system-output condition, 48 kHz/reload workaround, and maintainer non-reproduction. The live WebKit issue now shows **RESOLVED FIXED** with commit `266130@main` (`8c01a9fbfd35`) on 2023-07-18 (S8, issue status and comment 13). The revised text calls it “not a … confirmed general fix,” which avoids overgeneralizing but omits the exact landed change.

**Assessment:** Add the issue status/commit to the historical record while retaining the distinction that release inclusion and behavior on another Safari build were not verified. This is a locator/applicability correction, not evidence of a current-browser defect.

## Scope and disposition notes

- The released plan's capability-preservation sentence is addressed through a finite native fallback: named MIME candidates, then the browser default, then an explicit error. The draft explains why it does not silently substitute an unbounded custom Worklet pipeline. It does not claim that any candidate currently works.
- The Safari history supports rejecting the old blanket “Safari cannot use MediaRecorder” assumption: Safari 14.1 introduced MediaStream Recording; Safari 18.4 and 26.0 announce later format additions with release-specific scope. Those announcements do not prove any audio-only MIME string succeeds in the unpinned target build.
- The checked MediaRecorder draft supports the stated timeslice minimum/UA delay, track-set change failure, final event ordering, and non-playable individual-chunk rule. The Media Capabilities specification accepts a `record` configuration with an audio content type; the draft appropriately feature-detects it and retains a compatibility preflight.
- The 64 MiB app-retention proposal is clearly a proposed policy and is distinguished from browser-internal memory. The Worklet alternative names its encoder, muxer, buffer, and packaging obligations. The comparator is useful discovery rather than a recommendation to build a second pipeline now.
- R6 reports no browser tests and offers a finite matrix for exact builds and candidate formats. Its download checks can establish a user-triggered export and inspect an actual saved file when run; JavaScript alone cannot establish that the user persisted a file.
- Original prohibitions remain intact: permissioned microphone only, no upload/system audio/surveillance, no callback-count duration claim, no fabricated browser execution, and no unbounded raw PCM.

## Critic execution record

Independently reviewed the released artifacts and directly checked public specifications, vendor release material, issue history, and pinned implementation notes listed in `source-map.json` / `sources/index.md`. The investigator's hashes were verified against the frozen manifest. No code was downloaded or run. No browser validation was performed. Findings classify plan completeness and evidence; they do not revise or authorize the final plan.
