# User draft — voice memo capture component

Fixture ID: ER12-A3-02-FRESH. Authoring status: FINALIZED.
Root releases this draft only after substantive discovery. Working assumptions are intentionally unresolved user inputs, not assessed findings.

I want record, pause, stop, playback, and download controls. My draft obtains a microphone stream, constructs MediaRecorder with a single hard-coded WebM/Opus MIME string, requests a callback every second, and concatenates received chunks when stopped. It increments a duration counter on each callback and stops at 300 callbacks. On errors it currently just resets the controls; the permission/track cleanup path is missing.

I am carrying an old assumption that Safari cannot use MediaRecorder and therefore must always take a custom encoder path. I also assumed that Web Audio produces WAV files automatically, that choosing a sample rate guarantees the hardware records at that rate, and that a MIME support probe proves recording will work. These assumptions have not been verified against a selected released browser. Please research them rather than treating them as required product restrictions.

The fallback sketch uses an AudioWorklet to collect raw samples and keeps all samples until stop, then encodes a WAV download. I have not budgeted memory for five minutes, resolved channel layout, chosen an encoder, or addressed a page suspension. A format fallback should preserve the user's capture capability where support exists, but the page must honestly explain an unsupported operation. No new upload service is allowed.

Keep R1–R6 and the negative constraints binding. The revision needs explicit track cleanup, a truthful duration rule, format selection with failure handling, and a bounded buffer/export policy. It may choose native capture for some combinations and a fallback or explicit refusal for others if the evidence justifies that boundary. No claim of identical audio quality or cross-browser file compatibility is required.

Proposed validation only: denied permission; constructor/start failure despite a probe; a track ending mid-memo; backgrounding that delays callbacks; pause/resume; stop with pending data; playback and download for each selected format; resource cleanup after cancel. A small manual browser check would establish only the exact browser/version/operation exercised, not universal support. No browser has been opened and no audio has been recorded for this fixture.
