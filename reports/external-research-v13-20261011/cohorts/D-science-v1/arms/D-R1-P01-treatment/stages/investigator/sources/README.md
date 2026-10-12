# Source index — investigator discovery

Source IDs below are stable keys used by discovery.md and the required source-map.json. Pages were searched/opened via web search and direct open; direct-open batch start was 2026-10-12T04:19:44Z. No web-page snapshots or code were executed.

| ID | Source / locator | Version or commit | Use |
|---|---|---|---|
| S01 | [WCAG 2.2 Understanding 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), SC 4.1.3, Intent, examples, failures | WCAG 2.2; explanatory page updated 2026-05-11 | Pending/save/error status without focus; no need to create an announcement for every internal change; chatter caution |
| S02 | [WCAG 2.2 Understanding 3.3.1: Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), criterion and native HTML validation caveats | WCAG 2.2 | Textual identity/description and limits of browser-native errors |
| S03 | [WCAG 2.2 Understanding 3.3.3: Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html), SC 3.3.3 | WCAG 2.2 | Suggest known corrections unless unsafe |
| S04 | [WAI Forms Tutorial: User Notification](https://www.w3.org/WAI/tutorials/forms/notifications/), After submit / On focus change / In-line feedback | WAI tutorial, rolling | Summary and inline alternatives; focus return on explicit submit; includes an assertive example whose applicability is limited |
| S05 | [ARIA APG Alert Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/), About this pattern | APG rolling pattern | Alerts keep focus; persistent messages; frequency/interruption caveat |
| S06 | [WCAG 2.2 Understanding 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), SC 2.4.3 | WCAG 2.2 | Keep sequential keyboard order meaningful/operable |
| S07 | [WCAG 2.2 Understanding 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), 320 CSS pixel example and Resize Text overlap | WCAG 2.2 | Narrow/zoom layouts; permit wrapping and one-direction reading |
| S08 | [W3C Internationalization: Structural markup and right-to-left text in HTML](https://www.w3.org/International/questions/qa-html-dir), document direction and unknown/user text | W3C I18N guidance, rolling | dir=rtl and dir=auto mechanics only |
| S09 | [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), §§13.1.1, 13.2.2, 15.5.13 | RFC 9110, June 2022 | If-Match strong comparison, lost-update prevention, conditional failure/412 and already-applied caveat |
| S10 | [React Aria Forms guide](https://react-aria.adobe.com/forms), Validation, Server validation, localization | Current rolling docs; no exact package version/commit stated on page | Maintained implementation pattern; field-keyed server errors clear on field modification; backend validation; no request-race contract documented |
| S11 | [React Spectrum issue #6830](https://github.com/adobe/react-spectrum/issues/6830), report and metadata | RAC 1.3.1; opened 2024-08-05; closed via #8444 | React 19 automatic reset could reset values and discard action validation errors |
| S12 | [React Spectrum PR #8444](https://github.com/adobe/react-spectrum/pull/8444), merge and implementation notes | Merged 2025-07-07; commit effce79 | Fix updates current defaultValue on automatic reset and preserves action errors; programmatic reset handling is best effort |
| S13 | [React Spectrum issue #6983](https://github.com/adobe/react-spectrum/issues/6983), current behavior/reproduction fields | Open at retrieval; reported version “latest” (not pinned); opened 2024-08-30 | Reported native validation update/clear delayed until blur; unverified and unpinned |
| S14 | [GOV.UK Design System Error summary](https://design-system.service.gov.uk/components/error-summary/), How it works, link guidance, recent changes | Page records GOV.UK Frontend v6.2.0 (Jun 2026); history includes v4.4.0 | Maintained alternative: summary + matching inline text + links; focuses summary on form error; JAWS-related change history |
| S15 | [GOV.UK Design System Error message](https://design-system.service.gov.uk/components/error-message/), How it works and scope exception | Current docs; v6.2.0 referenced by the paired design system | Keep answers; associate text; do not represent service/eligibility failures as user input errors |

## Operation and limits

For S01–S15, observed operation was search followed by direct page open; access timestamp is the exact batch-start UTC recorded in discovery.md, not a per-page server timestamp (the browser tool reports no individual retrieval timestamp). Source statements are paraphrased in discovery.md. No claim is made that an example has been tested with the target portal, a particular screen reader, or a specific language.
