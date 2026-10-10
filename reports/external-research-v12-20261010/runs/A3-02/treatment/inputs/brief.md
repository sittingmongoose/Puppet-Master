# Short browser voice-memo capture

Fixture ID: ER12-A3-02-FRESH. Queue slot: A3-02.
Authoring status: FINALIZED. Synthetic user input; no external capability claims are supplied.

An existing workshop web page needs a small voice-memo capture component: microphone only, one memo up to five minutes, playback, and a local download. Research and plan the capture/export boundary for current desktop Chrome and Safari. Compare native MediaRecorder capture with a Web Audio/AudioWorklet capture-and-encode approach at the mechanism level. An established recorder implementation can provide an additional analog, but this is not a whole app build.

Fictional environment: HTTPS page, JavaScript frontend, existing controls, no backend, no library selected or browser version pinned. Users may deny or revoke permission, change their audio input, or background the page. The component may offer more than one download type if that is supported and honestly labelled. Exact supported container/codec combinations remain a research question.

Required final clauses:
- R1: Define permission, start/pause/resume/stop, track-ended, and cleanup behavior with an explicit error state.
- R2: Establish container/codec negotiation and fallback strategy, differentiating format support, successful construction, and successful capture/export.
- R3: Compare native recording with an AudioWorklet-based mechanism, including encoding responsibility, buffering, and scope/cost implications.
- R4: Explain data-chunk timing and assembly; do not treat callback frequency as a reliable clock or claim arbitrary chunks are independently playable.
- R5: Include a relevant released implementation/history detail and bind positive or negative capability statements to browser, version, API, operation, and conditions.
- R6: Specify a bounded validation matrix and clearly distinguish proposed checks from executed browser observations; disclose unsupported combinations and remaining uncertainty.

Negative constraints: no recording without user permission; no uploading audio; no background-surveillance feature; no system-audio capture; no five-minute promise based only on callback counts; no fabricated browser tests; no blanket capability denial from an old compatibility summary; no unbounded raw-audio buffering without a stated bound.

Use investigation/critique/revision stages of 30/12/18 minutes. Save a substantive discovery handoff with evidence, comparator mechanisms, and open implementation questions before root supplies the concealed plan. Final output is a small component plan with state/format boundaries and proposed validation, not an application. Browser execution is optional and must be reported accurately if performed. Sources and expected assessor outcomes are intentionally absent. No source research or browser testing has been performed by the fixture author.
