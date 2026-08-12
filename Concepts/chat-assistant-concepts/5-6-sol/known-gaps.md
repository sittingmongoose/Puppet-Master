# 5.6 Sol Known Gaps and Residual Risk

The concept family is complete as a comparison prototype, not as production implementation. These gaps remain visible and are not readiness claims for runtime integration.

## Integration gaps

- Commands and wiring are provisional. Exact current IDs were reused where the catalog was clear; question lifecycle, all-thread search scope, several Goal transitions, speed, access, BSD, artifact, attachment, draft, ordinary branch, and thread request/await/spawn actions still require owner-level catalog and reverse-wiring adjudication.
- The deterministic reducer is not a production state store. Thread, Goal, branch, outbox, route, permission, artifact, Usage, notification, and resource truth must come from their canonical owners.
- Prototype editor/reveal/export/settings deep links are visibly disabled with reasons. No fake file, provider setup, notification, or export side effect is claimed.
- Dock/pop-out uses one browser document and shared state. Production must prove cross-window handoff, crash/restart reconciliation, authentication, and stale-layout recovery through the shell/window owner.
- Cross-client persistence of local disclosure, history geometry, Context selection, and search view state is not decided here. Draft and question records are durable; purely local expansion stays local unless canon promotes it.
- No canonical Plan, Commands, Wiring, DRY, Settings, Usage, runtime, PMConcept7, or ConceptHub source was modified by this work.

## Slint portability risk

- This is an HTML/CSS/JavaScript comparison environment. It was structured around Slint-portable state, layout, transform, focus, and stable-id patterns, but no Slint 1.17.1 production component was created or compiled because runtime edits were forbidden.
- CSS container queries, `oklch()`, `color-mix()`, font fallback metrics, sticky/flex/grid behavior, and browser scrollbar styling require explicit translation to Slint tokens and layouts; they are not direct implementation instructions.
- Long-thread anchor preservation is validated in the browser fixture. Slint list virtualization, measured-height correction, streamed tail updates, and GPU/resource performance still require production tests with stable message keys.
- Popup collision and focus return are validated in the browser host. Detached native-window DPI, multi-monitor bounds, IME, screen-reader, and platform font differences remain production test work.

## Test and visual residuals

- Firefox/geckodriver completed the full suite over loopback HTTP. Chromium/Blink completed the same full suite through an isolated Chrome DevTools Protocol session using a `file:` entry and the same four checked-in JSON fixtures. The transport differs because this host's Chromium renderer independently fails before requesting even a trivial loopback page; no Chromium-over-HTTP pass is claimed.
- Direct visual inspection covered all 55 canonical Firefox evidence frames after authored motion had fully settled: 32 theme/width frames, eight questionnaire frames, eight work-system frames, and seven dense/error/offline/popup/controller frames. A separate 12-frame Chromium parity spot-check covered every theme family plus questionnaire, work, route-popup, and pop-out states; it is not represented as full Chromium-frame inspection. The 512 baseline and 896 core-feature configurations remain automated geometry/state coverage; they are not 1,408 individually human-reviewed images.
- The browser evidence proves the concept implementation in Gecko and Blink. It does not promote the prototype into production runtime readiness or substitute for native Slint rendering, platform accessibility, IME, detached-window DPI, and real-service latency tests.
- The required audit host for all 28 feature states is `window-05 × thread-02` for coverage only. That host selection is not a rank, preference, or winner recommendation.
- Automated checks cover all 64 pairings, all eight themes, four exact widths, continuous resize, both rail states, all history/artifact cross-products, dock/pop-out, reduced motion, long messages, question lifecycle, drafts, focus, popup collision, offline replay, and deterministic triggers. Production assistive-technology conformance and real provider/network latency are outside this prototype gate.
- Clipboard write depends on browser permission. Failure returns truthful status and does not alter content; native clipboard integration needs production-platform tests.

## Fixture limits

- Provider results, usage forecasts, setup/update/rollback notices, external effects, logs, backups, snapshots, browser/test/debug resources, and child activity are deterministic deep fixtures, not live services.
- The prototype does not ingest secrets, protected authentication-browser content, private provider payloads, or hidden model reasoning. Thought disclosure is limited to supplied provider-exposed summary fields.
- Artifact files are fixture objects. Loading/update/error/retry and selection are real UI states, but Open in editor and Reveal file remain disabled because no project-backed artifact path is owned here.
- Offline replay proves idempotency for the deterministic operation envelope and a reloadable local state path; it does not substitute for server-side distributed, multi-client, or crash-consistency testing.

## Deliberately unresolved here

- No concept winner is selected or recommended.
- No visual atom is declared canonical.
- No new command, event, schema, DRY component, setting, or runtime owner is approved by this folder.
- No product decision is silently inferred from a prototype-only controller or test host.
