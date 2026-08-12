# Shard 005: GUI visible testing repair addendum (2026-07-02)

Source: `Plans/Automated_Testing_System.md`

Source lines: L83-L98

Source SHA256: `cbf113bc3497116549e38ee16407505136466fca3596837cc3acbcfddb699533`

---

## GUI visible testing repair addendum (2026-07-02)

This addendum closes the visible testing UX defects from the PMConcept readiness report. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

Testing capability policy is implementation-ready only when the GUI exposes concrete controls and receipts, not merely policy prose. The production GUI must provide global and per-project rows for each capability family with inherited/effective state, `Auto`, `On`, `Off`, unavailable, blocked-needs-authority, and prohibited-by-policy projections. `Auto` may discover/select/install within authority; `On` blocks or asks for authority when unavailable; `Off` prohibits use and installation and never counts as successful verification.

The required command rows are `cmd.testing.capability_policy.set`, `cmd.testing.visibility_policy.set`, `cmd.testing.session.open`, `cmd.testing.session.watch`, `cmd.testing.session.background`, and `cmd.testing.session.redaction.inspect`. Each command must produce receipt evidence linked to the effective policy snapshot, visible-session identity, artifact/evidence refs, redaction profile, currentness/revalidation result, and fallback route when a visual surface cannot be embedded.

Visible testing projections must include `show_when_possible`, visible active, collapsed, detached, backgrounded, and non-embeddable states. Web evidence must show browser navigation, clicks, form input, assertions, screenshots, console, network, and pass/fail progression where supported. Native evidence must show Swift/live preview, hot reload, simulator, emulator, physical device stream, application window, interaction trace, screenshots, and logs where available and permitted.

Browser and GUI automation manifests must carry `browser_session_id`, PM-native browser runtime state, visibility state, Open/Watch state, `runtime_unavailable` remediation actions, PageRepresentation refs, screenshot/PDF/console/network artifact refs, and redaction manifest refs. Playwright/CDP may appear only as fallback or reference test-driver evidence; PM-managed native browser sessions are the product runtime identity. Negative fixtures cover no-browser/runtime-unavailable, hidden prompt-injection chips, redaction failure, no-network denial, SSRF/private-host denial, robots/fanout/depth denial, cache hit/miss/TTL, and partial crawl/research/source citation outcomes.
`python3 scripts/pm-plans-verify.py validate-web-capability-contracts` enforces the web capability contract surface: discriminated web/browser/research schema definitions, evidence branches, runtime/browser artifact payload fields, `/web fetch` parity, invocation provenance, prompt capability injection, plan-mode web visibility, retired `cmd.web.*` production exclusion, browser-unavailable coverage, security/cache/robots/citation tokens, and the Site Reader naming boundary.

Screenshots, videos, logs, console output, network traces, and artifact previews apply secret and sensitive-data redaction before display or persistence. Redaction failures block display/persistence until resolved or explicitly authorized by the owning policy; they do not silently downgrade evidence quality.

Acceptance coverage must prove effective-policy receipts, visible-session receipts, TestRunReceipt linkage, Open/Watch fallback behavior, background continuation, disabled reason projection, and redaction-before-display/persistence. PMConcept browser/terminal/testing demos are `concept_fixture_only` until those receipts and wiring rows exist.
