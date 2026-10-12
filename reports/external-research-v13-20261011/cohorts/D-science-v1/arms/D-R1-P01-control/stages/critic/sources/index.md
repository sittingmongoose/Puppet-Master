# Critic source index — D-R1-P01-control

Research context: independent review of the released D-P01 brief, revealed plan, and investigator package. Source IDs S01–S18 are carried forward unchanged from the investigator source map; each remains bound to the same exact URL. The index records my direct page review and the governing limits I observed. These are bounded source notes, not transcripts or claims of portal testing.

## S01 — WCAG 2.2 Recommendation

- Exact URL: [W3C WCAG 2.2 Recommendation](https://www.w3.org/TR/2024/REC-WCAG22-20241212/)
- Version: W3C Recommendation, 12 December 2024.
- Locator: §§1.4.4, 1.4.10, 3.3.1, 3.3.3, 4.1.3.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the exact Recommendation; inspected error identification and 320 CSS-pixel reflow text, and verified its status-message definition in the document.
- Governing condition/default/exception: detected input errors are identified and described in text; known correction suggestions are provided unless they jeopardize security or purpose; non-context-changing status messages are programmatically determinable without focus; resize and reflow criteria have stated thresholds and exceptions.
- Applicability: grounds the error, status, and layout baseline. It does not prescribe one summary design or establish translation quality or assistive-technology compatibility.

## S02 — WCAG Understanding: Status Messages

- Exact URL: [WAI Understanding SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- Version: WCAG 2.2 supporting document; live, informative page with no fixed release identifier.
- Locator: SC 4.1.3 intent, definition, examples, and live-region note.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the exact page and inspected the live-region over-notification note.
- Governing condition/default/exception: status concerns success/result, waiting, progress, or errors without a context change; exposing it without focus does not require creating extra messages; excessive live-region output should be user-tested.
- Applicability: supports concise, non-focus-taking state updates and the need to verify announcement volume; it is not compatibility evidence.

## S03 — W3C ARIA21 technique

- Exact URL: [WAI ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21.html)
- Version: WCAG 2.2 technique page; informative and live.
- Locator: Examples 1–2 and Tests.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the page and read its aria-invalid and aria-describedby examples.
- Governing condition/default/exception: the example marks a field invalid after a validation failure and associates readable error text with the relevant control; it is a sufficient technique, not the only conforming method.
- Applicability: supports the proposed HTML association/state shape, but does not prove a specific assistive-technology result.

## S04 — WAI Forms Tutorial: User Notification

- Exact URL: [WAI Forms Tutorial: User Notification](https://www.w3.org/WAI/tutorials/forms/notifications/)
- Version: WAI tutorial, live page with no fixed release identifier.
- Locator: Overall feedback, inline feedback, After submit, During typing.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the tutorial; inspected its after-submit example and first-invalid-field focus advice, as well as the typing-feedback section.
- Governing condition/default/exception: the tutorial presents combined overall and inline feedback, a submit-time focus example, and optional typing feedback; timing is contextual and its example does not define server-response freshness.
- Applicability: useful alternative patterns, not authority for the draft's async versioning rules or a compatibility claim.

## S05 — WCAG Understanding: Reflow

- Exact URL: [WAI Understanding SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- Version: WCAG 2.2 supporting document; live and informative.
- Locator: SC 1.4.10, basic text reflow, viewport equivalence.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the page and checked the 320 CSS-pixel and 400% viewport explanation.
- Governing condition/default/exception: vertically scrolling content fits a 320 CSS-pixel viewport without loss or two-dimensional scrolling; the exception is for portions that require two-dimensional layout for use or meaning.
- Applicability: grounds a narrow-layout check. It does not show that expanded translations fit.

## S06 — WHATWG HTML: language and direction

- Exact URL: [WHATWG HTML DOM section](https://html.spec.whatwg.org/multipage/dom.html)
- Version: HTML Living Standard; moving document without a fixed release or commit.
- Locator: §3.2.6.2 language determination; §3.2.6.4 dir attribute and Auto state.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the exact page and inspected the Auto-state text and its first-strong-directionality heuristic.
- Governing condition/default/exception: lang supplies language metadata; dir supports ltr, rtl, and auto; auto uses a very crude first-strong-directionality heuristic and is urged only as a last resort where direction is truly unknown and no better server-side heuristic applies.
- Applicability: supports explicit locale direction for interface chrome and cautious use of auto for unknown-direction content. It does not establish bidi rendering quality.

## S07 — WHATWG HTML: form constraints

- Exact URL: [WHATWG HTML form-control infrastructure](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html)
- Version: HTML Living Standard; moving page, retrieved text identified last update 8 September 2026, with no fixed release or commit.
- Locator: §4.10.21.4 Security; §4.10.21 Constraints.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the page and read the server/client validation security statement.
- Governing condition/default/exception: constraint validation is for user experience; servers should not rely on client checks because clients may bypass or omit them.
- Applicability: supports the draft's authority split; it does not choose the portal's business rules.

## S08 — OWASP Input Validation Cheat Sheet

- Exact URL: [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- Version: maintained Cheat Sheet Series page; no fixed release or commit exposed.
- Locator: Client-only checks; Validate Structured Data; Validating Free-form Unicode Text.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the page; read the server-side validation note and its free-form Unicode guidance.
- Governing condition/default/exception: validate on the server even when the browser checks the same fields; preserve legitimate punctuation and scripts in free-form text, and define consistent normalization when it is needed.
- Applicability: supports server authority and a multilingual notes/text contract. It does not define portal-specific limits or translations.

## S09 — RFC 9110: HTTP Semantics

- Exact URL: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- Version: RFC 9110, HTTP Semantics, June 2022.
- Locator: §§13.1.1 If-Match, 13.2 precondition evaluation, 15.5.13 412 Precondition Failed.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the RFC and inspected If-Match strong comparison, precondition order, failed-condition behavior, and the already-succeeded case.
- Governing condition/default/exception: If-Match uses strong entity-tag comparison and is commonly used to prevent lost updates; a false precondition normally prevents applying the method and may produce 412, except the origin server may return success when it can determine that the same state-changing request already succeeded.
- Applicability: supports conditional writes if the portal API supplies and enforces validators; it does not define UI conflict resolution or idempotency-key behavior.

## S10 — GOV.UK Design System: Error summary

- Exact URL: [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/)
- Version: live maintained documentation with no fixed version; page history includes Frontend v6.2.0.
- Locator: How it works, example markup, field links, recent changes.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the guidance and checked summary focus, one link per affected answer, and matching summary/inline wording.
- Governing condition/default/exception: the documented conventional validation pattern focuses the summary, links each listed error to its answer, and uses matching inline wording.
- Applicability: useful maintained model for complete error navigation. Its focus advice should not be copied unguarded for a delayed result after the reviewer has moved.

## S11 — GOV.UK Frontend v6.5.1

- Exact URL: [GOV.UK Frontend v6.5.1 release](https://github.com/alphagov/govuk-frontend/releases/tag/v6.5.1)
- Version/commit: v6.5.1, release commit efdc06c, released 14 September 2026.
- Locator: Release header, commit, and Fixes.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the release record; confirmed tag/short commit and that its listed fix was for a service-navigation example.
- Governing condition/default/exception: the release note does not describe a change to error-summary behavior.
- Applicability: identifies a maintained candidate version only; no component-specific behavior was retested at that tag.

## S12 — GOV.UK Frontend issue #1410

- Exact URL: [GOV.UK Frontend issue #1410](https://github.com/alphagov/govuk-frontend/issues/1410)
- Version: public historical issue opened 31 May 2019; linked PR #1459; retest marked fixed 7 October 2019.
- Locator: Description, screen-reader observations, cause, linked repair, and activity.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the issue, checked the reported legacy-page focus behavior and missing JavaScript explanation, and checked its retest status.
- Governing condition/default/exception: the report concerned a legacy full-page example using the older component without the expected GOV.UK Elements JavaScript; a linked repair was retested for that example.
- Applicability: shows that assembly details affect focus behavior; it is historical evidence and not current AT behavior proof.

## S13 — GOV.UK Frontend PR #1459

- Exact URL: [GOV.UK Frontend PR #1459](https://github.com/alphagov/govuk-frontend/pull/1459)
- Version: historical PR merged 18 June 2019, linked to issue #1410.
- Locator: PR title, merged discussion, changes to legacy full-page examples.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the linked PR and checked the stated legacy JavaScript/focus repair.
- Governing condition/default/exception: the repair ensured legacy JavaScript ran on legacy pages and repaired the legacy summary example; it did not test asynchronous SPA focus policy.
- Applicability: provides a bounded failure/fix lineage, not a general focus prescription.

## S14 — GOV.UK Design System issue #2799

- Exact URL: [GOV.UK Design System issue #2799](https://github.com/alphagov/govuk-design-system/issues/2799)
- Version: public 2023 accessibility-audit issue, opened 24 May 2023 and closed as completed.
- Locator: Description, code reference, user comments, closure activity.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the issue; checked the mismatch between href fragment #telephone-number and input id payment-amount, the reported failed return, and the later closure comment.
- Governing condition/default/exception: the cited example page had a summary link that did not match the field ID and lacked inline error text; the issue was later closed, with a commenter saying the guidance might already be sufficient and their own cross-check might have been mistaken.
- Applicability: concrete reported example-page failure mode for link-target checks, not proof of a current component defect or a release-level fix.

## S15 — USWDS Validation

- Exact URL: [USWDS Validation](https://designsystem.digital.gov/components/validation/)
- Version: live component documentation with download link v3.14.0; page says unsupported after v3.12.0; immutable component commit not inspected.
- Locator: About, code/guidance, known issues, latest updates.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the page; checked the lifecycle warning, client-side checklist example, and server-mirroring guidance.
- Governing condition/default/exception: the page describes live checklist feedback and says this validation component will not be supported after v3.12.0 due to major usability/accessibility issues.
- Applicability: bounded alternative/caution; current download link does not mean the pattern is recommended or supported.

## S16 — USWDS issue #5642

- Exact URL: [USWDS issue #5642](https://github.com/uswds/uswds/issues/5642)
- Version: public research issue opened 28 November 2023; closed as not planned.
- Locator: Summary, observations, implementation recommendations, research method.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the issue; read the five-participant findings and the scope of the high-fidelity prototype test.
- Governing condition/default/exception: all five participants in that specific form prototype missed a changed validation state until it was pointed out; participants expected inline error or submit-time error rather than a top confirmation checklist.
- Applicability: relevant but small study-specific caution; not a general population or compatibility claim.

## S17 — USWDS issue #5750

- Exact URL: [USWDS issue #5750](https://github.com/uswds/uswds/issues/5750)
- Version: public research issue opened 25 October 2023; closed.
- Locator: Summary, observations, affected-user groups, research method.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the issue; checked the four confused participants and the prototype setting.
- Governing condition/default/exception: four participants in the tested prototype did not understand the purpose of the top validation message and expected inline or submit-time validation; the issue separately says five visually impaired participants were involved in the research.
- Applicability: corroborates a pattern-specific risk, not a universal claim.

## S18 — WCAG Understanding: Error Identification

- Exact URL: [WAI Understanding SC 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- Version: WCAG 2.2 supporting document, updated 12 June 2026; informative.
- Locator: SC 3.3.1 interpretation; user-agent native HTML validation.
- Access UTC: 2026-10-12T04:38:36Z.
- Observed operation: reopened the page and inspected its native-browser validation discussion.
- Governing condition/default/exception: browser-native validation generally blocks submit, focuses the first invalid control, and shows generic messages; with multiple errors, only the first is exposed on a given attempt, and error visibility/magnification varies by user agent.
- Applicability: useful low-customization alternative and limitation; it does not replace server validation.

## Limits

No portal implementation, API, locale catalog, assistive technology, or translation was provided or tested. These notes do not claim portal behavior or compatibility.

