# Asynchronous multilingual service-request review form

## Recommendation and scope

Use one reusable form component with separate state for the reviewer’s decision, explanatory fields, notes, server validation, save attempts, and remote record state. Keep the service authoritative for eligibility and persisted values. Client checks can give earlier feedback for deterministic requirements, but cannot prove that a choice remains allowed against current service data.

Keep the active controls and their identity stable as messages arrive. Preserve dirty explanations and notes until the exact draft snapshot containing them is acknowledged by the server. A validation result is not a save confirmation. A server rejection, remote conflict, stale response, or interrupted request must never silently discard the reviewer’s text.

This is a component plan, not a toolkit decision. React Aria and GOV.UK are maintained examples of field-level validation and linked error-summary patterns; neither establishes the target implementation or its server contract. Evidence IDs S01–S15 and their exact URLs, locators, access times, conditions, and source limits are in this stage’s source-map.json.

## State and ownership

Maintain these separate records:

- **Local draft:** per-field value and dirty flag, a monotonically increasing form revision and field revision, stable field key, and the existing control’s focus/caret/selection. Keep decision explanation and notes in the draft even when the visible decision is rejected.
- **Current server snapshot:** canonical values plus an opaque ETag or a monotonic service revision, if supplied. ETags support equality and conditional writes; do not sort them or infer time from their text. [S09]
- **Validation request/result:** request ID, form-instance ID, field key/value, decision and draft revisions, and server version used for the check. A result is current only if its captured identity still matches. Abort superseded work when possible, but still reject stale replies on arrival because cancellation does not prove no reply can arrive.
- **Save attempt:** immutable submitted snapshot and revision, base ETag, request/idempotency key if supported, and status: idle, saving, acknowledged, rejected, conflict, or outcome unknown. A successful reply acknowledges only that submitted snapshot. Later local edits remain dirty.
- **Remote update:** newest canonical representation and any server-declared field dependencies or revision sequence. A collaboration event signals new state; it does not authorize overwriting local edits.

A server may validate a decision against entity data that the reviewer did not edit. When the service cannot identify the dependencies, treat any newer entity version as making decision validation stale. Use a monotonic service revision or refetch to establish ordering. If-Match uses strong entity-tag comparison; a false precondition means the operation is not applied and may produce 412. RFC 9110 also permits success when the server can determine that the same state-changing request already succeeded, such as after a lost response. The portal’s actual conflict and idempotency contract remains an owner/API decision. [S09]

### Transitions

| Event | Required state change and behavior |
|---|---|
| Local edit | Increment form and changed-field revisions; mark only changed fields dirty; mark prior dependent validation stale. Preserve the control, selection, explanations, and notes. |
| Local deterministic check | Run the applicable simple check at the selected input, blur, or submit timing. Keep display timing deliberate; do not announce every keystroke as a save. Client success remains provisional. [S02, S10] |
| Remote decision check | Start when the selected decision or commit policy calls for it. Capture the request tuple and server version. A newer check supersedes only the same validation scope; do not let one global counter suppress unrelated field results. |
| Current reply | Apply only when the full request tuple matches. Show validation pending/result through visible text and a programmatic status without changing focus. A current-valid result says “valid,” not “saved.” |
| Stale reply | Ignore it for the current decision and do not announce it as current. If its field has disappeared because the form state changed, do not attach it to a replacement control. |
| Blocked explicit commit | Keep every draft value. Present all current actionable input errors in a linked summary before the fields and beside the relevant controls. Recommend moving focus to that summary once for this user-initiated blocked commit; a first-invalid target is an alternative to evaluate. [S02, S14] |
| Save starts | Capture an immutable draft snapshot/revision and base ETag; expose “saving.” Allow edits during the attempt only if the product supports them, and give those edits a later revision. |
| Save succeeds | Mark only the submitted snapshot acknowledged and adopt the canonical response/version. Preserve any later edits as dirty; never replace them with older response values. |
| Validation rejects / 412 conflict | Preserve all local text and notes. Refresh the current server state, mark dependent validation stale, and require an explicit reviewer resolution before retrying. |
| Transport interrupted after send | Report outcome unknown, not saved or definitely failed. Reconcile by fetching current state or using a service-supported operation/idempotency key before claiming success or replaying a consequential action. |
| Remote event arrives during save | Compare using a server revision or refetch when ordering is uncertain. Preserve local dirty values and focus; invalidate any validation based on an older context. |

The component owns the unsaved draft, current controls, focus/caret, display timing, and request correlation. The service owns policy validation, accepted persistence, canonical values, and atomic version checks. A collaboration feed owns notification that another reviewer changed the record, but cannot overwrite the local draft.

## Error, conflict, pending, and save presentation

### Input errors and service conflicts

For an input error—such as a required or formatted value, or a choice the authoritative response identifies as outside the current allowed values—show textual guidance beside the relevant control, associate it programmatically, expose its invalid state, and include it in a persistent summary link to that control. Use matching summary and inline wording. Provide a known correction or next step unless doing so would compromise the service’s purpose. Do not rely on color alone or on a transient browser bubble as the only description. [S02, S03, S14, S15]

A remote eligibility, permission, capacity, or concurrency change is a service-state conflict when the problem is the changed canonical state rather than the information the reviewer supplied. Present it as a persistent conflict/review notice, not as a claim that the reviewer made an input mistake. Keep it in the form’s findable recovery inventory, identify the current server choice/version and what changed, and provide explicit actions such as “Use the current choice” or “Review my choice again.” Link the notice to the decision or resolution control. If the authoritative service instead classifies the submitted value itself as disallowed under current rules, show the field-level input error as well. These cases must not be conflated. [S02, S15]

When a current rejection arrives after the reviewer has moved to another field, update the persistent error or conflict notice and its summary entry, then provide one concise status such as “The selected decision changed. Review the decision notice.” Keep the reviewer’s focus and textarea selection where they are. Do not move focus for each asynchronous reply. [S01, S05, S14]

### Pending and saved status

Keep durable error/conflict detail in the page and use a visible, programmatically exposed status for meaningful milestones such as “Checking decision,” “Saving,” “Decision needs review,” “Saved,” or “Could not confirm whether the save completed.” Coalesce simultaneous results into a useful current message. Do not announce every keystroke, every retry, or each obsolete response. WCAG explains how status changes can be exposed without focus and says the criterion does not require authors to create a new status for every change; the APG alert guidance directly warns about frequent interruptions and focus changes. [S01, S05]

Use separate validation and save wording. “Current choice accepted for version N” and “Draft saved at revision N” describe different facts. A success check does not imply durable persistence.

## Strategies and alternatives

### Asynchronous validation

1. **Decision-change check with debounce and response correlation.** Check an intentional decision change after a short owner-chosen delay, cancel superseded work if possible, and still verify the request tuple on every response. Show pending state and one current result. This gives earlier service feedback, but depends on current server state and needs careful coalescing.
2. **Relevant-field blur or explicit submit/commit.** Check on blur where a particular field’s rule benefits from that timing, or wait until the reviewer submits/commits. WAI and React Aria document blur/committed-value validation as one option; they do not establish that every service check should run on every field blur. Submit-only avoids intermediate calls but delays discovery. Compare these timings for the actual service rules and latency; keep client and server checks distinct. [S04, S10]
3. **Announcement policy.** Persistent inline/summary details with one concise polite status is the default. An immediate assertive alert per result is an alternative only for a product-defined urgent condition; frequent alerts can interrupt work. No strategy should move focus for a background reply. [S01, S05]

### Remote conflict handling

1. **Record-level stop and reconcile:** any stale version blocks the save, retains all dirty fields, fetches the latest record, and asks the reviewer to resolve before retry. This is the safe fallback when dependencies are unknown, though it can require review after unrelated changes.
2. **Service-described field merge:** refresh clean fields, preserve dirty fields, and flag overlapping edits only when the service can identify safe field independence. Revalidate a decision whenever a relevant context version changes and still use a conditional final write. This reduces unrelated interruptions but requires an explicit dependency/merge contract. [S09]

Do not silently adopt a new server choice, overwrite a dirty explanation, or retry a stale decision. Which strategy is viable depends on server metadata not supplied in the brief.

### Public implementation failure history

React Spectrum issue #6830 reports a specific React 19 Actions plus React Aria Components 1.3.1 failure: automatic form reset restored an earlier default value and cleared action-returned server errors. PR #8444 merged on July 7, 2025 (commit effce79), updates reset state to the current defaultValue, and preserves those errors using best-effort reset-event handling. If a selected framework uses this lifecycle, include a regression test for it; do not generalize the report to all form libraries or current versions. Issue #6983 remains an open, unpinned report about native-mode errors updating only on blur; it is a test lead, not verified behavior for a specific release. [S11, S12, S13]

### Error-summary focus

For an explicit blocked commit, recommend one focus move to the summary with links to every current input error; it exposes the full recovery set. A first-invalid target with a summary also available is a reasonable alternative. The GOV.UK pattern documents summary focus and matching field links; WCAG’s native-validation discussion describes browser focus behavior, while the WAI Forms tutorial recommends a linked error list but does not prescribe first-invalid focus. Choose after keyboard and supported assistive-technology evaluation. Neither strategy applies to each late asynchronous result. [S02, S04, S14]

## Layout, language, and keyboard behavior

Use flexible dimensions and no fixed field/error heights. Test ordinary form content at a 320 CSS-pixel viewport and at 200% text enlargement/zoom; labels, localized messages, summary links, and controls must wrap and remain reachable without two-dimensional page scrolling. Keep focused controls visible when messages are inserted. WCAG’s reflow guidance uses a 320 CSS-pixel equivalent and describes exceptions for content whose meaning or use requires two-dimensional layout; none is apparent for ordinary form text. [S06, S07]

Set the document’s base direction from the interface language using markup. Use field-level direction handling such as dir=auto for unknown-direction notes and user text; it infers direction from the first strong character and has documented corner cases. Handle identifiers, URLs, and mixed-script snippets deliberately, and use logical layout properties rather than hard-coded left/right mirroring. These are direction mechanics, not proof of translation quality or assistive-device compatibility. [S08]

Keep semantic reading order stable and keyboard-operable. Summary links must reach the relevant visible control or resolution action. If a field becomes conditional and is removed, retain its dirty text in the owning draft; do not let a late response for it target a different form or field. If a still-current service response names a field that is not rendered, preserve the issue in the summary/recovery inventory and provide a deliberate path to the field or resolution instead of dropping it.

## Proposed test strategy

All cases below are proposed. Use deterministic service fixtures/fakes for order and status; assert state and rendered interaction, not only request counts.

| Case | Trace | Assertions |
|---|---|---|
| Out-of-order checks | Decision A/revision 4 starts request 41; B/revision 5 starts 42; B-valid returns first, then A-invalid. | Only B/version/current revisions are displayed or announced; reply 41 cannot invalidate B. |
| Late reply after focus moved | Start a current decision check; tab to an explanatory textarea and select text; then return a rejection. | Same control, focus, caret, and selection remain; current notice and status are findable; no pointer is needed. |
| Disappearing conditional field | Start a request for a decision whose dependent field is visible; change decision so that field unmounts; then return the old reply. Also test a still-current server issue whose target field is conditionally hidden. | Old reply is stale and ignored; no reply attaches to a replacement control/form instance. Preserve hidden dirty text. A still-current issue remains in the recovery inventory with a path to reveal/resolve it. |
| All-error recovery | Explicit commit returns two input errors and a service conflict. | Input errors link to matching controls with text and programmatic associations; the service conflict is distinguishable and has a resolution action; keyboard activation reaches each target. Run the chosen submit-focus policy once. |
| Validation versus save | Choice is current-valid, but no save has occurred; then save revision 8 succeeds while a local edit creates revision 9. | UI says valid-but-unsaved before save; only revision 8 is acknowledged; revision 9 stays dirty. |
| Rejection preserves explanation | Submit decision, multiple explanation fields, and notes; service rejects the decision. | Every explanation and note remains verbatim; only the affected decision state changes; next action is explicit. |
| Remote invalidation | Version 12 accepts a choice; another reviewer changes to version 13 and makes it unavailable while the reviewer is editing another field. | Mark validation stale, show current conflict and recovery, preserve draft/focus; accept only a response based on version 13. |
| Save/remote race | Save revision 8 with ETag A; send remote update and save response in both orders. | Use service revision or refetch; ETag is not sorted; no old reply overwrites newer canonical state or local revision 9. |
| Conditional write rejection | Save with If-Match; server returns 412 and a fresh representation. | Preserve all dirty text, show the current service state, require explicit resolution, and do not claim the write succeeded. |
| Interrupted save | Test failure before send separately from response loss after server commit. | Before-send failure is distinguishable; post-send state remains unknown until reconciliation or supported idempotency resolution. Never claim saved/failed prematurely. |
| Navigation away | Attempt to leave with a dirty draft and with an unknown save outcome. | Provide a keyboard-operable stay/resolve/leave choice under the owner’s retention policy; unload is not treated as a durable save. |
| Narrow/zoom/expanded copy | 320 CSS-pixel viewport, 200% text, long labels/errors/summary links. | Text wraps, controls and links remain operable, no ordinary-content two-dimensional scrolling, and focus is not obscured. |
| RTL and mixed text | LTR and RTL interfaces, mixed-script note, Latin identifier and URL. | Check direction, punctuation, link target, reading order, and keyboard flow. This is not a translation-quality result. |
| Keyboard/status volume | Run error, pending, save, and several superseded-result paths by keyboard. | No pointer dependency; no background focus movement; meaningful current status only; no announcement for each keystroke or obsolete response. |

After implementation, propose browser keyboard/zoom/reflow checks, evaluation with the supported screen-reader/browser combinations, and multilingual usability work with approved translations and RTL reviewers. The target portal, service, supported AT matrix, and localized strings were not available in this reference review, so none of those checks is claimed as executed.

## Owner/API decisions still needed

1. Which fields and service data versions determine choice eligibility; whether the service supplies a monotonic revision and field-dependency/merge metadata.
2. Which rules use input, blur, decision-change, or explicit-commit validation, and the latency/call-volume limits.
3. Whether the draft remains editable during save and what exact snapshot/version the service acknowledges.
4. The save API’s If-Match/412 and idempotency/reconciliation contract.
5. Whether explicit blocked commit focuses the summary or first invalid field after evaluation.
6. Whether draft explanations may persist through route changes/reload and for how long.
7. Which messages are service-localized versus client-localized, who approves translations, and which browser/AT matrix is supported.

## Checks actually run and evidence limits

The native Goal activation and binding guard were observed before case/source review. The investigator’s release helper and source-map syntax check are predecessor-stage checks; they do not establish form behavior. In this critic stage, primary source guidance and the maintained implementation/failure-history pages S01–S15 were directly reviewed. No application code, executable witness, portal, browser, synthetic state trace, assistive technology, or translation check was run. All behavioral, integration, accessibility, and multilingual checks above remain proposals.

