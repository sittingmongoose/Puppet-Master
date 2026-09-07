# Astra verification and review

September 4, 2026. This is browser-concept verification, not production certification.

## Reproducible source

Baseline commit: `4c88c0f01300cea36135b73eec96991d73969aa2`.
Baseline `TestPMConcept.html` SHA-256: `ea9c502a1c4a456f3e092c45d3524105153f9bba52d36f26fbfad922e885a4ef`.
Final `TestAstraPmConcept.html`: 5,881,458 bytes; SHA-256 `761e4f931ab02333adec57190e9376c3acee3b18a99d60117a0f38f025808867`.

The original concept, PMConcept7, shared source and Plans were not edited. The builder checks baseline identity and deterministically regenerates only the Astra copy.

## Behavioral verification

**28 of 28 checks passed. No browser page errors were recorded.** The 23-check acceptance run made no network requests. The additional five tests use actual pointer/keyboard interaction where appropriate, in addition to the handler-level state checks. The supplied scripts fail on an assertion, not merely on a missing screenshot.

Coverage: initial local defaults and required name; back/close/resume without creation; source sign-in before commit; self-hosted service HTTPS and account invalidation; SSH default, identity confirmation and revalidation; mounted-share alternative; connected-device new-project path; pairing failure; existing folder/online/backup preflight; recovery key exclusion from persistent state; failed commit/retry/idempotency and real project-card/picker projection; explicit CLI install versus authentication; direct-key and multiple-account choices; optional free-model flow; returning-user settings; actual Settings Transfer preview/apply; bounded cached discovery; full tour with project continuity and no tour AI usage; pause/resume/skip; eight themes and constrained layout; reduced motion; real theme buttons; pointer-driven Teacher/ELI5/Chat drag; exact restoration of all workspace surfaces including sizes; explicit layout retention; state serialization and reconstruction.

Test-only in-memory Storage is necessary in this managed Chromium environment. Local URL navigation is blocked, so the full HTML is loaded with `set_content`. Storage reconstruction is tested, but **real browser disk persistence, browser navigation, reload across browser versions, and native storage are not certified**. The delivered HTML does not include the test Storage shim.

## Visual review

Inspected actual browser screenshots for all eight themes and the constrained layout, plus project review, provider setup, completed setup, and the tour. Read motion as contact sheets, rather than inferring motion quality from CSS. Critical 60-fps windows cover the illustration crossfade, real Chat drag, and in-place plan change. The complete walkthrough also has a separately labelled one-frame-per-second overview; this overview is not misrepresented as every-frame inspection.

The full application shell remains present. The concept Hub manifest passes its validator. Theme/reduced-motion forwarding also passes an offline test using the actual wrapper and a child `srcdoc`. That is **not a claim of a successful native Hub URL-navigation run** under the blocked browser policy.

## Iterations and corrections

The initial appearance recording averaged approximately 14 animation callbacks per second. Paint-cost probes isolated backdrop blur and repeated whole-shell styling as the main costs here. Replacing the full-screen blur with a scrim and previewing themes locally in setup raised appearance delivery to about 47.6. Applying the selected theme to the shell occurs on leaving setup.

The real workspace drag initially failed on a missing event method; the adapter now supplies the existing controller's expected event contract. Stable drop-target hysteresis is respected. The guide does not chase the moving Chat panel. Obsolete animation transforms are cancelled after their final state is applied.

The tour originally exposed a transient old Wizard preview and altered restored panel sizes through the owner's normalization pass. Practice is now mounted before navigation. Restoration transactionally persists the validated snapshot, while normalization renders a clone. Exact whole-workspace geometry restoration and the explicit keep-layout alternative both pass.

An existing background demo clock initially changed usage during the tour test. The tour pauses that clock and restores it afterward. The guided Teacher exchange itself is local and makes no AI request. The same plan card is retained across a changed answer, and the build boundary never starts production work.

A recording-export collision was caught before delivery. The setup clip was rerecorded into a unique target with a bounded recorder lifetime, then decoded in full with ffmpeg before replacing the failed export. The tour clip was also fully decoded without errors. This fix did not alter the tested HTML.

## Final recording measurements

| Recording | Capture stream | Mean browser rAF | Median callback interval | 95th percentile interval |
|---|---:|---:|---:|---:|
| Complete setup | 60 fps | 47.61 fps | 16.7 ms | 33.4 ms |
| Complete 13-step tour | 60 fps | 57.11 fps | 16.7 ms | 16.8 ms |

These are concurrent Chromium/Xvfb/software-environment measurements at 1440 x 960 during screen recording. No frame interpolation is used. Capture rate is **not** rendered animation rate. The setup is not locked at 60 fps in this environment, and occasional delayed frames remain. These numbers are not native Slint or user-hardware performance guarantees.

Nine of thirteen tour steps concern planning. Measured step dwell for those steps was 73,254 of 108,565 milliseconds (67.47%). This records the authored demonstration, not an assertion about how fast a beginner will complete the tour.

## Production boundaries and remaining validation

OAuth callbacks, CLI installs, NAS/SSH checks, remote pairing, filesystem/repository creation, restoration, provider quotas and model readiness are **labelled simulations**. Actual source/SSH/provider owners are not implemented by this HTML. Account sign-up links are real outbound links; a distinct sample action advances the concept. Do not use real secrets in sample fields.

The existing project-picker, Chat, widget menu, workspace layout and Settings Transfer owners are exercised. The planning practice adapter demonstrates interactions inside the actual Wizard surface, not a production planning compiler. Command-shaped diagnostic labels are not new approved catalog entries and do not dispatch production mutations. Full action-to-catalog/adapters/receipts parity remains part of implementation work; see `PORTING.md`.

No unmoderated usability study with novice participants was performed. The design has expert flow review and browser evidence, not measured novice task-success evidence. No universal smoothness or production readiness claim is made.
