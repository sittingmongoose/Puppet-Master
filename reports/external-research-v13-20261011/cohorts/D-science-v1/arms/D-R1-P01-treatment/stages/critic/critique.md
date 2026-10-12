# Independent critique and finalization record

**Run/stage:** D-R1-P01-treatment / critic  
**Inputs reviewed:** the original brief, complete investigator discovery and draft, the investigator source map and index, the released plan, and its release record named in the input map. The exact released plan text is assessed clause by clause below. Sources S01–S15 were directly reopened and checked against the consequential claims in the package; reviewer observations and the UTC access window are recorded in this stage's source-map.json.

## Findings

### C1 — Material incomplete: the released “disappearing fields” check is missing

**Draft locator:** “Meaningful proposed validation plan”; proposed cases.  
**Evidence:** the released plan explicitly requires checks for “disappearing fields.” The draft covers late replies, changed decisions, conflicts, and navigation, but does not test a field or form instance disappearing while its request is in flight. Its general request-correlation discussion is not an executed or proposed test of that failure path.

**Resolution in final:** accepted. The final adds a deterministic conditional-field/unmounted-field case. It checks both a stale response after the decision changes and a still-current response whose target field is no longer rendered: neither may attach to a replacement control or vanish from the find-all recovery path. The test remains proposed.

### C2 — Unsupported source attribution: WAI tutorial does not prescribe first-invalid focus

**Draft locators:** “Field errors and all-errors recovery”; P2.3 disposition; carried source-map S04.  
**Evidence:** the directly reopened WAI Forms “User Notification” page recommends listing errors before the form, identifying the corresponding control, and linking to it; its dynamic-list example uses an alert. Its “On focus change” section shows a field check on blur. It does not recommend focusing the first invalid field after submit. The WCAG error-identification explanation (S02) says browsers generally return focus to the first invalid field under native validation; GOV.UK's maintained error-summary pattern (S14) explicitly focuses the summary. These are distinct behaviors and contexts.

**Resolution in final:** accepted. The final recommends one summary-focus action after an explicit blocked commit, with linked errors, as a component recommendation aligned with S14 and subject to evaluation. It preserves first-invalid focus as a possible alternative, not as a WAI tutorial requirement. Background replies never move focus.

### C3 — Unsupported generalization: blur checks are not inherently noisy or unsuitable

**Draft locators:** recommendation; P1.2; “Two presentation strategies for asynchronous validation.”  
**Evidence:** WAI's tutorial (S04) demonstrates checking a field on blur where validating every keystroke would show errors during most partial input. The current React Aria guide (S10) also documents checks on committed values, such as blur, alongside realtime and server validation. These examples do not establish that a server request on every unrelated field blur is desirable; nor do S09 or S10 establish the draft's broad “noisy” rationale for rejecting it.

**Resolution in final:** accepted with qualification. The final does not make a universal timing rule. It compares decision-change/debounced validation, relevant field blur, and submit/commit checks; ties each request to the value/revision/version it checked; and leaves timing, cost, and delay limits for the service owner and proposed prototype evaluation. It recommends avoiding an automatic policy check on unrelated blur events unless the field or product contract justifies it.

### C4 — Material incomplete: separate input errors from remote service conflicts

**Draft locators:** “Field errors and all-errors recovery”; “State transitions”; “Per-clause disposition” P2.2 and P2.4.  
**Evidence:** the brief's central remote case is a choice that was previously acceptable but becomes unacceptable after another reviewer changes service state. The draft correctly models a conflict and retains local text, but some passages call every such result a field error and put it into the input-error presentation. GOV.UK's error-message guidance (S15) says not to use an input error message for ineligibility, permission, capacity, or another problem with the service rather than the supplied information. WCAG's input-error definition (S02) covers omitted user information or a user value outside required format/allowed values. Those categories may overlap only when the authoritative response actually identifies the submitted value as an input error.

**Resolution in final:** accepted. The final separates (a) a field-level validation error for an input value the server says is unacceptable from (b) a service-state conflict or eligibility change. The latter gets a persistent, findable conflict notice, the latest canonical choice/state, and explicit recovery actions; it is not labeled as the reviewer's input mistake. The notice is linked to the decision and included in the form's recovery inventory. Neither path clears local explanations or notes.

### C5 — Minor locator/wording correction: “excessive chatter” attribution

**Draft/source-map locator:** pending/status discussion; carried source-map S01.  
**Evidence:** the WCAG status page (S01) says the intent is to avoid unnecessary interruption and that the criterion does not force authors to generate new status messages. The page does not make the draft's specific “excessive live-region chatter” statement. The APG alert guidance (S05) directly warns that frequent interruptions inhibit usability and that alerts should not affect keyboard focus or disappear too quickly.

**Resolution in final:** accepted. The final attributes the interruption-frequency warning to S05 and states the scope of S01 precisely. The source IDs remain bound to their original URLs; details are in source-map.json.

## Complete brief-scope review

| Original obligation | Critic assessment of investigator package | Final disposition |
|---|---|---|
| Sourced reusable component plan with alternatives and useful test strategy | Substantially met; the plan is detailed and does not select a UI or validation toolkit. It needs C1, C2, and C4 corrections. | Final retains full scope, alternatives, and adds the missing test. |
| Pending validation, errors, save state, and another reviewer's changes | Covered with distinct validation/save/remote states and focus-preserving behavior. Conflict notice semantics need C4. | Final distinguishes input errors, service conflicts, validation, and persistence. |
| Narrow layouts, zoom, expanded labels, and RTL | Reflow, wrapping, logical properties, dir, and dir=auto are covered. The evidence correctly does not establish translation or assistive-technology compatibility. | Retain; final specifies proposed 320-CSS-pixel and 200%-text checks and direction edge cases. |
| Late errors, all-error discovery, and return to relevant field | Persistent field messages, links, and no focus theft are covered. WAI first-invalid attribution requires C2 correction. | Retain linked recovery; focus the summary once on explicit blocked commit as the recommendation, test alternatives. |
| Client checks versus server authority | Correctly says client checks are early guidance and server validation/acceptance is authoritative. | Retain and distinguish current validation from durable save. |
| Compare at least two asynchronous-validation and remote-conflict strategies | Both pairs are present. The critique of blur timing needs C3 qualification; service conflicts need C4. | Preserve change/debounce, relevant blur, submit/commit, and assertive/coalesced options; preserve record-level and service-described merge options. |
| Stale replies, interrupted saves, transitions, ownership | Strong request correlation and snapshot acknowledgment, opaque ETag handling, outcome-unknown state, and client/server/feed ownership are present. | Retain, and add form-instance/conditional-field identity to the response tuple. |
| No pointer dependency, color-only errors, response-triggered focus, or keystroke save announcements | Text and keyboard routes, no asynchronous focus movement, and coalesced milestones are described. | Retain; proposed assertions explicitly cover these constraints. |
| Preserve unsaved explanations after rejection or remote change | Covered throughout; React Spectrum history is carefully bounded. | Retain verbatim preservation through rejection, conflict, stale response, and uncertain save. |
| Do not infer translation quality or AT compatibility | Explicitly respected. | Retain as an evidence limit and proposed evaluation only. |
| Distinguish proposed from executed validation | Correctly states synthetic traces, portal integration, browser/AT, and translation checks were not run. | Final keeps all behavior checks proposed and records the independent source review separately. |

## Exact released-plan disposition audit

| Released clause | Critic assessment of draft disposition | Finalization |
|---|---|---|
| P1.1 local validation while typing | “Revise” appropriately distinguishes cheap local checks from message timing and server authority. | Retain; permit input/blur/submit display policies suited to each rule. |
| P1.2 server check on every field blur | “Revise” is plausible, but its general “noisy” rationale is not evidenced and should not rule out blur where useful. | Retain blur as a conditional strategy; tie it to a relevant field/rule and exact request tuple. |
| P1.3 inline messages plus summary above submit | Inline association and a find-all summary are useful; summary placement above the submit control is weaker for early discovery than placing it before the form fields. | Keep inline messages and put the unresolved-issue summary before the fields; distinguish service conflicts from input errors. |
| P1.4 one status for validation and save outcomes | Retain with meaningful milestones and validation/save separation is sound. | Retain, use a concise current status, coalesce simultaneous results, and avoid per-keystroke announcements. |
| P1.5 fields plus status are sufficient | Rejecting sufficiency is supported by missing associations, links, ordering, focus, and direction rules. | Retain rejection and spell out each contract. |
| P2.1 one sequence number discards older replies | Retain/extend is sound; a sequence alone is not enough when decision, draft, entity, or form instance changes. | Match request, field/value, decision and form revisions, and service version; ignore stale replies even if they arrive last. |
| P2.2 refresh clean fields; conflict dirty fields | Conditional merge is sound only with server-declared field independence and current eligibility checks. | Retain that condition and fall back to record-level reconciliation when dependencies are unknown. |
| P2.3 preserve position; first-invalid focus after submission | Background focus preservation is essential. First-invalid is a candidate, but WAI tutorial citation is unsupported; GOV.UK documents summary focus. | Recommend summary focus once for explicit blocked commit; retain the alternative as an owner choice to evaluate. |
| P2.4 retain unsaved text until successful save | Snapshot acknowledgment and preserving newer drafts are correct; React reset history is bounded to its release/context. | Retain; never clear fields on validation, conflict, stale, or unknown outcome. |
| P2.5 delayed checks, save/conflict, navigation | Covered with useful transitions and honest local-storage/retention questions. | Retain; add a conditional-field/disappearing-request case. |
| P3.1 flexible labels/errors/no fixed heights | Correct and relevant. | Retain with 320 CSS pixel and 200% text checks. |
| P3.2 document direction covers mixed text | Rejecting sufficiency is supported; W3C says dir=auto is useful for unknown-direction inputs and also documents corner cases. | Retain; use field-level direction handling and test identifiers and punctuation; do not infer localization quality. |
| P3.3 validation success differs from save success | Correct. | Retain explicitly in state and copy. |
| P4.1 dispositions with primary context | Substantially met, subject to source attribution and scope refinements above. | Retain; criticism dispositions are recorded here and in final. |
| P4.2 proposed checks and executed status | Strong coverage, but the disclosed disappearing-fields case is absent. | Retain, add that case, and keep proposed portal/AT/translation work distinct from source review. |

## Overall disposition and unresolved inputs

The draft's core transaction model, ownership boundaries, persistent all-error recovery, focus stability, flexible layout, unsaved-value preservation, and separation of validation from saving are supported and retained. C1 and C4 are material completeness repairs; C2 and C3 correct evidence and preserve conditional alternatives; C5 corrects source attribution. No supported obligation is removed.

The following are honestly unresolved external inputs, not reasons to narrow the brief: the service's eligibility dependencies and monotonic version contract; exact fields tied to each server check; whether edits continue during save; conditional-field behavior; API If-Match/412 and idempotency contract; allowed draft retention across navigation; localized message ownership; supported browser/AT matrix; and the product choice of validation timing and explicit-submit focus policy.

## Work actually performed

- Read the complete frozen brief and released plan plus the complete investigator package and carried source index.
- Directly reopened the primary standards, maintained implementation guidance, failure reports, fix PR, and HTTP specification S01–S15; source-specific observations are recorded in source-map.json.
- No portal implementation, executable witness, synthetic trace, browser, assistive technology, or translation evaluation was run. Every test in final.md is proposed.

