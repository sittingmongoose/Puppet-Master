# 5.6 Sol Known Gaps and Residual Risk

The concept family is complete as a comparison prototype, not as production implementation. These gaps remain visible and are not readiness claims for runtime integration.

## Integration gaps

- Commands and wiring are provisional. Exact current IDs were reused where the catalog was clear; question lifecycle, all-thread search scope, several Goal transitions, speed, access, BSD, artifact, attachment, draft, ordinary branch, and thread request/await/spawn actions still require owner-level catalog and reverse-wiring adjudication.
- The deterministic reducer is not a production state store. Thread, Goal, branch, outbox, route, permission, artifact, Usage, notification, and resource truth must come from their canonical owners.
- Prototype editor/reveal/export/settings deep links are visibly disabled with reasons. No fake file, provider setup, notification, or export side effect is claimed.
- Dock/pop-out uses one browser document and shared state. Production must prove cross-window handoff, crash/restart reconciliation, authentication, and stale-layout recovery through the shell/window owner.
- Cross-client persistence of local disclosure, history geometry, Context selection, and search view state is not decided here. Draft and question records are durable; purely local expansion stays local unless canon promotes it.
- The deliverable and Sol-scoped changed-path set are confined to this folder. The repository was already dirty and no correction-start dirty-status receipt exists, so current Git status cannot independently attribute existing changes in Plans, PMConcept7, another concept folder, or other out-of-scope paths to a particular task.

## Slint portability risk

- This is an HTML/CSS/JavaScript comparison environment. It was structured around Slint-portable state, layout, transform, focus, and stable-id patterns, but no Slint 1.17.1 production component was created or compiled because runtime edits were forbidden.
- CSS container queries, `oklch()`, `color-mix()`, font fallback metrics, sticky/flex/grid behavior, and browser scrollbar styling require explicit translation to Slint tokens and layouts; they are not direct implementation instructions.
- Long-thread anchor preservation is validated in the browser fixture. Slint list virtualization, measured-height correction, streamed tail updates, and GPU/resource performance still require production tests with stable message keys.
- Popup collision and focus return are validated in the browser host. Detached native-window DPI, multi-monitor bounds, IME, screen-reader, and platform font differences remain production test work.

## Test and visual residuals

- The frozen final Firefox 153.0.4 / Gecko lane passed 33/33 checks over loopback HTTP, with zero console errors, zero runtime exceptions, and 115 captures.
- The frozen final Chromium 151.0.7922.34 / Blink lane passed the same 33/33 checks from the checked-in `file:` entry, with zero console errors, zero runtime exceptions, and 115 captures. A separate Chromium loopback-HTTP boot probe failed 0/1 before fixture readiness. The failed diagnostic is retained separately; Chromium-over-HTTP is not claimed.
- All 115 current canonical Firefox PNGs received one-at-a-time original-resolution inspection. No current Chromium capture is included in that direct-inspection count.
- The 512 baseline, 896 feature-state, 432 continuous-resize, 160 history/artifact, and other large matrix cells are automated geometry/state evidence. They are never counted as individual human visual reviews.
- The 59 corrected trigger frames were visually inspected, but many lifecycle triggers intentionally expose their most obvious visible change as the exact bottom receipt. Their required non-receipt semantic mutation is proved by automated before/after assertions rather than inferred from pixels alone.
- The four supplied films were fully decoded and reviewed through temporary sampled sheets, but those derived temporary sheets were not copied into the deliverable. The custody files preserve packet identities, review method, and hashes rather than independently re-runnable derived film-review imagery.
- Browser evidence supports the HTML/CSS/JavaScript prototype in Gecko and Blink under the recorded transports. It does not promote the prototype into production runtime readiness or substitute for native Slint rendering, platform accessibility, IME, detached-window DPI, and real-service latency tests.
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
