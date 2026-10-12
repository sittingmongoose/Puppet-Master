# Independent critic review — D-R1-P01-control

## Review scope and judgment

I reviewed the full released brief, the complete investigator discovery and draft, its source map and carried source index, the revealed plan and its reveal record, and the linked primary sources. The revealed plan hash and release timestamp reported by the investigator match the identifiers carried in the package, and the draft addresses every released clause with one disposition. I did not write or repair a final plan.

The package is strong and substantially answers the brief. Its main design is coherent: distinguish local edits, validation of a particular snapshot, and authoritative saved version; bind asynchronous replies to request/revision/resource version; preserve focus after delayed events; use an explicit error summary and inline text; condition writes on a server version; retain the draft through rejection, conflict, and uncertain outcomes; and separate proposed product validation from work actually performed. I found no materially wrong primary-source claim. A few decisions need to be made explicit before another team could implement the plan without inventing behavior.

The investigator's source IDs S01–S18 are preserved without rebinding in this stage's source map and navigable source index. I reopened all 18 exact URLs and independently checked the governing passages for the consequential claims, including RFC 9110's already-succeeded exception and the bounded status of the USWDS and GOV.UK history.

## Findings

Classification: **material wrong**, **material incomplete**, **unsupported**, **minor locator/wording**, or **honestly unresolved external input**.

### C-01 — Material incomplete: current validation must become stale when its inputs change

**Locators:** draft.md, “Recommended component behavior” paragraphs 1–2; “State model and ownership boundaries,” Clean → Editing, Check pending → Current error/current valid, Any pending check → Stale reply; proposed matrix items 1–2 and 5.

The package binds a pending reply to local revisions and resource version, which is the right response to out-of-order replies. It does not define the transition for a result that is already displayed as current and then becomes obsolete after a later edit or remote change. The table has a general Editing transition, but no Current valid/error → Stale validation transition, and the error summary is defined as listing all “current” errors without saying how it drops or labels an error for the prior value. An implementer could leave an old error visible as current, clear an error prematurely, or keep a previous “valid” state after a dependent field or resource version changes.

Bind each displayed result to its checked value/revision/resource version, explicitly move it to a visible “needs recheck” or equivalent stale state when a dependency changes, and say when it leaves the current error summary. Preserve the text while doing so. Add tests for editing a field after a current error, editing a dependency after current success, and a remote update after both states. This is needed for the brief's requirement that the displayed validation describe the choice the reviewer is actually considering. WCAG requires text identification of detected errors; ARIA21's example ties invalid state and its description to a failed field state. [S01](sources/index.md#s01) [S03](sources/index.md#s03)

The draft also does not explicitly say to include a correction suggestion when one is known and safe to provide. Add that to the error-content rule or make the owner decision visible; WCAG 3.3.3 has a security/purpose exception. [S01](sources/index.md#s01)

### C-02 — Material incomplete: make pending validation visibly persistent

**Locators:** draft.md, “Recommended component behavior,” status paragraph; state table, Editing → Check pending.

The draft proposes a concise, non-focus-taking status channel and says it may announce “Checking decision.” The transition only says to optionally announce it; it does not require visible text that persists while a check is pending or say how that state is cleared/replaced. The brief asks the form to expose pending validation and save status. A screen-reader announcement alone, especially one that can be missed, does not give a reviewer who has moved on a later way to see what is still unresolved.

Specify persistent text such as “Checking decision…” and associate it with the affected decision/snapshot; replace it with current valid/error, stale/rechecking, or failure state when resolved. Keep it out of focus and deduplicate announcements. The standards define waiting/progress/result information as status-message content, while WAI warns that announcement frequency must be user-tested; neither source dictates this particular visible presentation. [S01](sources/index.md#s01) [S02](sources/index.md#s02)

### C-03 — Material incomplete: compare user-facing async presentation alternatives

**Locators:** draft.md, “Alternatives and trade-offs”; “Maintained implementation evidence”; released-plan dispositions P1.5–P1.6.

The alternatives table compares validation timing and network behavior: decision checkpoint/field exit versus explicit submit/save. It compares remote update delivery versus save-time comparison. Those are useful strategy comparisons, but both validation strategies mostly reuse the same presentation: inline errors, a summary, and one status channel. The USWDS live checklist is described as a caution, not compared as a presentation alternative with the chosen feedback model. The brief explicitly requests comparison of strategies for presenting asynchronous validation and remote conflicts.

Make the comparison user-facing: for example, compare persistent inline/current-field feedback plus a concise overall status against a top checklist/live success feedback, and compare immediate remote-update notice plus explicit review against conflict discovery only at save. State which events announce, what remains visible, focus behavior, and the tradeoff in response timing and message volume. The existing check-trigger and push/poll comparisons can remain as supporting operational alternatives. GOV.UK supplies a conventional summary/inline pattern; the USWDS evidence is limited to specific prototypes and should not be generalized. [S10](sources/index.md#s10) [S15](sources/index.md#s15) [S16](sources/index.md#s16) [S17](sources/index.md#s17)

### C-04 — Unsupported: cancellation does not prove non-processing

**Locator:** draft.md, “Recommended component behavior,” paragraph 2.

The claim that cancelling a browser request cannot establish whether the server processed it is plausible and important to the race model, but the draft does not cite a source or mark it as an engineering inference. Keep it as an explicit design assumption/inference and verify it against the chosen transport and API contract, or add an appropriate primary source. The draft otherwise correctly says cancellation is not freshness/version control. I did not treat the claim as false.

### C-05 — Honestly unresolved external input: API and persistence contract

**Locators:** draft.md, concurrent-reviewer and save sections; ownership paragraph; matrix items 5–6.

The brief supplies no server API. Strong ETag/If-Match enforcement, relevant dependency versions, structured conflict facts, operation ID lookup, and idempotent retry are proposed contracts, not currently evidenced portal capabilities. The draft generally labels these as owner/API decisions, which is appropriate. Before implementation, the API owner must specify whether conditional writes are atomic, how the server indicates an already-applied retry after a lost response, how an operation is reconciled, and which fields can invalidate a decision. RFC 9110 supports the conditional-write mechanism and expressly allows success when the same state-changing request appears already applied; the draft's “unknown” state and retry caveat leave room for this, but the API behavior still needs a contract. [S09](sources/index.md#s09)

The draft says to retain local explanations and notes after rejection/conflict, satisfying the explicit preservation requirement in the in-form cases. Route changes, browser closure, session expiry, and persistence of a draft across return are not resolved; the draft correctly marks route/session lifetime as an owner/privacy decision and proposes a route-away test. That is an honest unresolved boundary, not a defect to solve without product input.

### C-06 — Honestly unresolved external input: locale, content direction, and compatibility

**Locators:** draft.md, language/direction discussion and proposed matrix item 7; execution limits.

The explicit locale direction plus cautious use of auto for direction-unknown text is consistent with WHATWG. The draft correctly avoids claiming translation quality or AT compatibility and proposes long-string, RTL/LTR, keyboard, and later assistive-technology evaluation. The actual locale set, identifier formats, permitted Unicode normalization, and supported browser/AT matrix remain owner/content/API inputs. In particular, the component/API contract should say that legitimate scripts and punctuation in free-form notes are not rejected by a narrow ASCII-only check; OWASP's free-form Unicode guidance is relevant, but the domain's actual limits are not supplied. [S06](sources/index.md#s06) [S08](sources/index.md#s08)

### C-07 — Minor locator/wording: bound the GOV.UK #2799 closure carefully

**Locators:** draft.md, “Maintained implementation evidence”; sources/index.md S14.

The reported example code did contain an error-summary href targeting #telephone-number while the intended input had id payment-amount, and the issue records users unable to reach the field. The issue later closed as completed, but its closure comment says the reporter thought the existing guidance might already be sufficient and that their own cross-check might have been mistaken. The draft already limits the claim to a particular page and says the status is not proof of a release-level fix; retain that scope and mention the closure uncertainty if presenting it as failure history. Do not characterize this as a verified defect in current GOV.UK Frontend. [S14](sources/index.md#s14)

## Brief and plan coverage

| Obligation | Assessment |
|---|---|
| Pending validation, errors, save status, and remote changes | Addressed, with C-01/C-02 needing explicit currentness and visible pending transitions. |
| Do not take focus for every response; preserve keyboard position after late errors | Addressed with a guarded focus proposal, persistent summary links, and explicit keyboard tests. The exact focus guard remains an owner decision pending real evaluation. |
| Avoid excessive announcements and per-keystroke save announcements | Addressed by checkpoint/deduplicated status proposals; user testing of message order and volume remains proposed. |
| All errors discoverable and linked back to a relevant control | Addressed by inline text, full summary, and keyboard-operable links. Add target existence/currentness assertions to tests (the draft already proposes these). |
| Client checks vs server authority | Addressed and supported by WHATWG/OWASP. |
| Async stale responses and interrupted saves | Strongly covered by revisions, request identity, resource versions, snapshots, operation IDs, dirty flags, unknown outcome, and reconciliation caveats. Add the displayed-current-result invalidation transition in C-01. |
| At least two validation/conflict strategies | Operational alternatives are present. User-facing presentation alternatives are under-comparative; see C-03. |
| Narrow layouts, text zoom, expanding labels, and direction | Addressed as proposals with 200% text, 320 CSS-pixel reflow, long strings, mixed direction, and a clear no-translation-quality-claim boundary. |
| Preserve unsaved explanation after rejection | Addressed: retain local values on validation failure/conflict/unknown outcome; confirmed save marks the captured snapshot clean rather than clearing visible text. |
| Primary guidance, maintained implementations, and public failure history | Strong: WCAG/WAI, WHATWG, RFC, GOV.UK, USWDS, and bounded public history are cited and independently checked. |
| Exact released-plan dispositions | All 18 P1–P4 clauses have one explicit disposition; none is silently dropped. |
| State transitions, ownership, alternatives, and meaningful test plan | Strong coverage, with the missing validation-staleness transition noted above. |

## Proposed versus executed validation

**Executed in this critic stage:** read the named brief/package and released plan; reopened the 18 carried primary-source URLs and checked the passages described in [sources/index.md](sources/index.md). I did not run a portal, browser, API, integration test, screen reader, translation review, or synthetic implementation trace.

**Reported by the investigator, not independently rerun by this critic:** native-goal/artifact mechanics and source-map/index parsing/hash checks in the investigator's execution record. The investigator explicitly reports that no product test or assistive-technology/multilingual evaluation ran.

**Proposed, not executed:** the investigator's request-reordering, edits-during-pending, remote-version race, 412, interrupted/late save, error-summary link, keyboard/focus, accessibility-tree, 200%-text, 320-CSS-pixel, locale expansion, RTL, browser/AT, and multilingual checks. They are appropriately labelled future validation; passing a DOM/tree check would not establish AT compatibility.

