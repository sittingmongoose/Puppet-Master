# Bounded primary-source index

Research context: D-P01 brief only, read before source discovery. Public pages were retrieved in multiple batches; the exact UTC access time for each source is recorded in its source entry. Notes below preserve stable source IDs, scoped paraphrases and locators. They are not transcripts, implementation tests, translation reviews or assistive-technology compatibility claims.

## S01 — WCAG 2.2 Recommendation

- Exact URL: https://www.w3.org/TR/2024/REC-WCAG22-20241212/
- Released version: W3C Recommendation, 12 December 2024 (stable publication).
- Locator: §§1.4.4 Resize Text, 1.4.10 Reflow, 3.3.1 Error Identification, 3.3.3 Error Suggestion, 4.1.3 Status Messages.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened the W3C Recommendation and located the success-criterion text.
- Governing conditions/defaults/exceptions: automatically detected errors need text identification; correction suggestions are required when known unless they jeopardize security or purpose; status messages in markup must be programmatically identifiable so AT can present them without focus; text supports 200% resize; ordinary vertical content reflows at 320 CSS px without two-axis scroll except content that needs two-dimensional layout.
- Applicability: normative accessibility baseline for field error text, non-focus-taking status, zoom and narrow layout. It does not mandate one specific error layout or prove localized copy or AT behavior.

## S02 — WCAG 2.2 Understanding: Status Messages

- Exact URL: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- Version: WCAG 2.2 supporting document; informative, live page; no fixed release identifier on retrieved page.
- Locator: SC 4.1.3 Intent, definition/examples, notes on live-region use.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened page and reviewed definition, focus condition and chatty-risk note.
- Governing conditions/defaults/exceptions: applies to messages conveying outcome, waiting, progress or errors without a change of context; role/properties expose status without taking focus; the criterion does not require creating new status messages; live regions can over-notify and should be user-tested.
- Applicability: pending, saved, validation and conflict summaries can be statuses. Use only for concise state changes; this is informative interpretation, not AT compatibility evidence.

## S03 — W3C ARIA21 technique

- Exact URL: https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21.html
- Version: WCAG 2.2 technique page; informative sufficient technique, live page.
- Locator: Description, Example 2, Tests.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: reviewed examples of aria-invalid, aria-describedby, and the test procedure.
- Governing conditions/defaults/exceptions: technique says not to set aria-invalid=true before validation; after failure it can flag the field and a programmatic description can point to its error; checks include that invalid state is absent when no failure exists and present when a failure exists.
- Applicability: supports markup/association shape if this portal uses HTML. It is one sufficient technique, not the only conforming approach and not a universal AT guarantee.

## S04 — WAI Forms Tutorial: User Notification

- Exact URL: https://www.w3.org/WAI/tutorials/forms/notifications/
- Version: WAI Forms Tutorial, live page; no dated release identifier on retrieved page.
- Locator: Overall feedback, error listing, inline feedback, After submit, During typing.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened tutorial and inspected submit and live-region examples.
- Governing conditions/defaults/exceptions: combines overall and per-field feedback; gives an error-summary example with field links and aria-describedby; a submit-time example suggests focus on the first invalid field; typing example uses polite live text for an availability result and states it is read after typing stops.
- Applicability: gives alternative notification patterns. The typing demo uses a local synchronous value list, so it does not establish freshness rules or compatibility for asynchronous server checks.

## S05 — WCAG 2.2 Understanding: Reflow

- Exact URL: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- Version: WCAG 2.2 supporting document; informative, live page.
- Locator: SC 1.4.10 and Basic text reflow.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened page and reviewed viewport and exception details.
- Governing conditions/defaults/exceptions: vertical-reading content fits 320 CSS px without loss or horizontal scrolling; horizontal-reading content uses a 256 CSS px height equivalent; 320 CSS px corresponds to a 1280 px viewport at 400% zoom; only sections needing two-dimensional layout for use/meaning are excepted.
- Applicability: component recommendation is single-column wrapping with errors and status in normal flow. Must separately test translation expansion and supported locales.

## S06 — WHATWG HTML Living Standard: DOM, language and direction

- Exact URL: https://html.spec.whatwg.org/multipage/dom.html
- Version: HTML Living Standard; moving source with no fixed release or commit, retrieved 2026-10-12.
- Locator: 3.2.6.2 language determination; 3.2.6.4 dir attribute, including Auto state.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened DOM section and inspected lang/dir algorithm text.
- Governing conditions/defaults/exceptions: lang provides an element language value; user agents may use it for pronunciation, fonts and control UI; dir supports ltr, rtl and auto; auto uses a crude first-strong-character heuristic and the standard urges it only when direction is truly unknown and no better server-side heuristic exists.
- Applicability: use explicit page direction from the selected locale for interface chrome; consider auto only for unknown user-entered text. This specifies markup behavior, not successful translations or end-to-end RTL rendering.

## S07 — WHATWG HTML Living Standard: form constraints

- Exact URL: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
- Version: HTML Living Standard, live; retrieved text identified the standard as last updated 8 September 2026, with no fixed release/commit.
- Locator: §4.10.21.4 Security; §4.10.21 Constraints.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened form-control infrastructure and located the constraint-validation/security sections.
- Governing conditions/defaults/exceptions: client constraint validation is intended to improve user experience, not provide security; the standard says servers should not rely on it because clients can be bypassed or may not implement it.
- Applicability: client checks can provide immediate syntax/required feedback, but server-side validation remains authoritative for decision policy and every write.

## S08 — OWASP Input Validation Cheat Sheet

- Exact URL: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- Version: maintained Cheat Sheet Series page; no fixed release/commit exposed on retrieved page.
- Locator: Input Validation Strategies; Implementing Input Validation; Common Pitfalls.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened page and located strategy and client-only-check guidance.
- Governing conditions/defaults/exceptions: validate syntax and semantics; server checks must still run even if browser checks same fields; client checks give immediate feedback; free-form Unicode text should be accepted broadly subject to legitimate rules rather than narrow ASCII filters.
- Applicability: separates user-experience checks from authorization and business rules. The portal owner must define the actual domain policy and note/explanation limits.

## S09 — RFC 9110: HTTP Semantics

- Exact URL: https://www.rfc-editor.org/rfc/rfc9110.html
- Released version: RFC 9110, HTTP Semantics, June 2022.
- Locator: §§13.1.1 If-Match, 13.2 precondition evaluation, 15.5.13 412 Precondition Failed.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened RFC and located the If-Match and 412 provisions.
- Governing conditions/defaults/exceptions: If-Match uses strong entity-tag comparison, is typically used on state-changing methods to prevent lost updates, and must be evaluated before performing the method; if false, the server must not perform the method and may respond 412 (with a defined already-succeeded exception); 412 means a request condition evaluated false.
- Applicability: a resource revision/ETag precondition is a standards-based option for avoiding stale decision writes. Requires the portal API to supply and enforce validators; the RFC does not decide how to merge or present a conflict.

## S10 — GOV.UK Design System: Error summary

- Exact URL: https://design-system.service.gov.uk/components/error-summary/
- Version: live maintained documentation, not version-pinned; its history names changes through GOV.UK Frontend v6.2.0. The separately retrieved latest release was v6.5.1, but component-specific behavior of that tag was not inspected.
- Locator: How it works, field links, example markup, recent changes.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened guidance and example markup, and reviewed update history.
- Governing conditions/defaults/exceptions: always show a summary on validation error, also show inline error text, focus the summary, link each error to its field, and keep summary/inline wording identical; error markup uses role=alert nested in the component. History says v4.4.0 moved alert inside after a JAWS issue reading the full summary.
- Applicability: useful maintained pattern for completeness and error return. Its normal form-submission focus guidance should not be copied blindly to a delayed response after a reviewer has moved; the brief requires focus preservation.

## S11 — GOV.UK Frontend release v6.5.1

- Exact URL: https://github.com/alphagov/govuk-frontend/releases/tag/v6.5.1
- Released version/commit: v6.5.1, release commit efdc06c (short hash shown on the release record), dated 14 September 2026; shown as latest when accessed.
- Locator: release header and Fixes.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened the signed-tag release page and inspected version, commit and release note.
- Governing conditions/defaults/exceptions: this is a fix release; the listed fix changes a service-navigation example, not error-summary logic.
- Applicability: establishes current maintained candidate version only. It does not establish that every earlier component behavior was changed or tested in v6.5.1.

## S12 — GOV.UK Frontend issue #1410

- Exact URL: https://github.com/alphagov/govuk-frontend/issues/1410
- Version: public historical issue, opened 31 May 2019; closed via PR #1459 and marked fixed on retest 7 October 2019.
- Locator: Description, screen-reader observations, Solution, Activity.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened the issue and reviewed report, attributed cause, closure link and retest.
- Governing conditions/defaults/exceptions: a legacy full-page example omitted GOV.UK Elements JavaScript and used the older component; audit observers reported focus landing differently in JAWS, NVDA, desktop VoiceOver and iOS VoiceOver. The thread says it was a usability issue without a WCAG reference and confirmed fixed after retest.
- Applicability: useful failure history that focus behavior can depend on the full example and user-agent/AT combination. It is not evidence that those AT behave the same today.

## S13 — GOV.UK Frontend PR #1459

- Exact URL: https://github.com/alphagov/govuk-frontend/pull/1459
- Version: historical pull request merged 18 June 2019; linked as resolution of issue #1410.
- Locator: PR title and diff/history for the legacy applicant-details example and focus script.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened the PR linked from #1410; inspected its discussion/history.
- Governing conditions/defaults/exceptions: repair was to the legacy review example’s focus setup, not proof that an asynchronous SPA can always move focus safely.
- Applicability: shows a fix/retest lineage for the specific failure; no blanket implementation conclusion.

## S14 — GOV.UK Design System issue #2799

- Exact URL: https://github.com/alphagov/govuk-design-system/issues/2799
- Version: public accessibility audit issue opened 24 May 2023; issue page marks closed/done.
- Locator: Description, current code reference, user feedback, proposed solution and status.
- Access UTC: 2026-10-12T04:22:27.088Z.
- Observed operation: opened issue and inspected the reported code and resolution guidance.
- Governing conditions/defaults/exceptions: a summary link targeted a different ID than the input ID, and the inline error was missing; users reported that activating the link did not reach the field. Proposed correction was to match the href fragment to the input ID and include its field error.
- Applicability: a concrete failure mode for the summary’s return-to-field contract. Issue status does not establish that the portal implementation is fixed; no release-specific verification was retrieved.

## S15 — U.S. Web Design System: Validation

- Exact URL: https://designsystem.digital.gov/components/validation/
- Version: live USWDS component documentation, retrieved with site download link at v3.14.0; documentation says validation component will be unsupported after v3.12.0. No immutable component commit inspected.
- Locator: About the validation component; code/guidance; Known issues; Latest updates.
- Access UTC: 2026-10-12T04:31:50.985Z.
- Observed operation: opened page, inspected the live example, lifecycle caveat, known-issues text and change history.
- Governing conditions/defaults/exceptions: component provides a top checklist with client-side live feedback; docs say mirror checks server-side; docs report usability/accessibility issues and no support after v3.12.0.
- Applicability: useful alternative and caution against assuming that progressive live checklists will be noticed or understood. Current page/version statement is not evidence that its pattern is recommended.

## S16 — USWDS issue #5642

- Exact URL: https://github.com/uswds/uswds/issues/5642
- Version: historical issue opened 2023-11-28; issue is closed as not planned.
- Locator: Summary, observations, implementation recommendations, research method.
- Access UTC: 2026-10-12T04:31:50.985Z.
- Observed operation: opened public issue and read the research summary, sample and disposition.
- Governing conditions/defaults/exceptions: high-fidelity form-prototype usability test with five participants (three blind; five total used a screen reader and/or magnification); participants did not notice the validation change, and they expected inline validation or error on submit rather than a top confirmation checklist. Issue recommends considering inline validation and submit-time errors.
- Applicability: directly relevant caution for this brief’s live-announcement choice, but this is a small specific prototype study, not a universal claim about users or products.

## S17 — USWDS issue #5750

- Exact URL: https://github.com/uswds/uswds/issues/5750
- Version: historical research issue opened 2023-10-25; issue page closed.
- Locator: Summary, observations, affected-user groups.
- Access UTC: 2026-10-12T04:32:20.890Z.
- Observed operation: opened issue and inspected test finding.
- Governing conditions/defaults/exceptions: four screen-reader and/or magnification participants tested the form prototype; they did not understand the top validation message and expected inline or submit-time validation.
- Applicability: corroborates that a success checklist may not match expectations in the tested form. Does not generalize beyond that prototype or establish multilingual or AT compatibility.

## S18 — WCAG 2.2 Understanding: Error Identification

- Exact URL: https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- Version: WCAG 2.2 supporting document, updated 2026-06-12; informative, not normative.
- Locator: SC 3.3.1 interpretation; User agent native HTML form validation; native validation disadvantages.
- Access UTC: 2026-10-12T04:32:20.890Z.
- Observed operation: opened page and reviewed native browser validation behavior and limitations.
- Governing conditions/defaults/exceptions: browsers generally prevent invalid submit, show generic messages, and focus first invalid field; depending on user agent messages may not persist or magnify; with several errors, only first is exposed and resubmission may be required.
- Applicability: native validation is a low-customization alternative for simple cases, but its user-agent-controlled error behavior must be tested against the portal’s need to expose all errors, preserve focus after delayed checks, and support zoom. It does not replace server-side authority.
