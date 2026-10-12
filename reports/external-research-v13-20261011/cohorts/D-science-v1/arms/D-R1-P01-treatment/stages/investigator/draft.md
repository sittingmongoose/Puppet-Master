# D-P01 — Review of the provisional asynchronous form design

## Recommendation

Keep the core of the proposal: validate on both client and server, show errors next to fields and in a find-all summary, use a non-focusing status surface, track response order, keep a dirty draft separate from the persisted record, and use flexible layout. Revise the event and state contracts before implementation. A validation result is only current for the exact draft revision and server version it checked; a save result acknowledges only the submitted snapshot; a conflict or unknown network outcome must never clear the local explanation or notes.

The server remains authoritative for eligibility and persisted review state. The client can reject obvious local mistakes early, but a locally valid choice is not proof that it remains allowed. The component owns the active controls, unsaved draft, focus/caret, presentation, and request correlation. The service owns policy validation, canonical values, and atomic version checks. A remote event reports a newer version; it does not authorize replacing any local dirty field.

This is a review design, not a selected toolkit. React Aria is a maintained implementation reference for field associations and mapping server errors by field; GOV.UK Design System documents a complementary error-summary pattern. Neither establishes that the portal is built in React, adopts GOV.UK, or already supports the service's concurrency model. [S10, S14, S15]

## State and transaction contract

Maintain separate state for the decision, explanatory fields, notes, validation, save, remote version, and visible status. Suggested core data:

- Draft: per-field value, dirty flag, local draft revision, and focus/caret that stays with the existing control.
- Validation request: request ID, decision value, draft revision, and server version used for the check.
- Validation result: unchecked, checking, current-valid, current-invalid with field-keyed text, or stale. It is current only when its captured decision/revision/version still match.
- Persisted snapshot: last server-acknowledged values and canonical entity version/ETag.
- Save transaction: submitted draft snapshot/revision, base ETag, request/idempotency key if supported, and saving, saved, rejected, conflict, or outcome-unknown state.
- Remote state: newest canonical representation plus a monotonic service revision/event sequence. An opaque ETag supports equality/precondition checks; do not sort or infer temporal order from ETag strings.

### State transitions

| Event | Validation state | Save/draft state | Required behavior |
|---|---|---|---|
| Local edit | Mark a result for the old revision stale; run cheap local checks | Increment draft revision and mark only changed fields dirty | Preserve current control, caret, text, and notes. Do not announce a save for each edit. |
| Decision selected | Start a server check tied to the exact decision, draft revision, and base server version | Remain dirty until an explicit save/commit | A newer check supersedes the prior one. Abort if practical, but still verify response identity on arrival. |
| Current check succeeds | Current-valid for the exact tuple only | No change to saved/dirty state | Show pending/result text without focus movement; this is not “saved.” |
| Current check rejects | Current-invalid, with persistent text for the relevant field and current summary entry | Keep all dirty fields and notes | Explain the rejected choice and known permitted next step. A late rejection is surfaced while focus stays where the reviewer moved it. |
| Submit/save | Recheck or require current validation for the same revision and server version; capture an immutable save snapshot | Saving(snapshot revision, base ETag) | Keep editing possible if the product allows it; edits after capture get a later revision and remain dirty. |
| Save succeeds | Accept validation only if it describes the same current choice/version | Acknowledge only the submitted snapshot and adopt returned canonical ETag/revision | If the draft advanced during the save, preserve newer edits as dirty. Do not replace them with the older response. |
| Server validation rejects | Record errors against the submitted field values/revision | Rejected; do not clear draft | Preserve the decision explanation and notes. Errors for values already edited again are stale and must be revalidated. |
| If-Match fails / remote conflict | Mark any policy-dependent choice stale and recheck against canonical current state | Conflict; preserve local dirty fields and refresh remote snapshot | Show which server value changed and offer an explicit resolution. RFC 9110 defines If-Match with strong entity-tag comparison for preventing lost updates; a failed precondition means the operation is not applied and may be returned as 412. [S09] |
| Network interruption after send | Do not infer valid/invalid from transport failure | Outcome unknown, not “saved” and not definitely “failed” | Reconcile by GET/current version or a service-supported idempotency key before claiming success or replaying a consequential action. RFC 9110 allows success where the server can determine that the same state-changing request already succeeded after a lost reply. [S09] |
| Remote event arrives during save | Invalidate validation whose server-version basis is obsolete | Compare event and response using a monotonic service revision; refetch if ordering cannot be established | Preserve draft and focus. Do not let arrival order overwrite newer data. |

A sequence number is useful but needs a scope and an identity check. Use a per-decision validation generation (or per independently validated field) and compare the request ID, submitted value, local draft revision, and server version before applying any response. A single global “latest request” can suppress unrelated field results; a per-field sequence alone can still miss that the policy context changed. Cancellation is an optimization, not the correctness rule, since a response may already be in flight.

For concurrent save and remote-change events, use an explicit server revision sequence or fetch canonical state whenever the client cannot prove ordering. ETags are opaque entity identifiers for equality and preconditions, not ordered counters. If the service cannot identify which fields affect eligibility, treat any newer record version as invalidating decision validation until the server checks it again.

## Presentation and focus

### Field errors and all-errors recovery

Show every current error in text. Associate each field message with its control and expose the invalid state programmatically; the summary links to the same field and uses wording consistent with the inline message. The W3C guidance requires textual identification when an input error is automatically detected and recommends known correction suggestions unless they would jeopardize security or purpose. It also explains limits of default browser error bubbles (generic or transient text, small text when zoomed, and only one error exposed at a time). [S02, S03]

Prefer the summary at the top of the form content, before the fields, rather than immediately above the submit control. The GOV.UK pattern requires an error summary and matching inline messages, with links to each affected answer; its frontend moves focus to the summary for a validation-error state. WAI's forms tutorial gives a different valid recovery choice—focus the first invalid input after an unsuccessful submit. These are alternatives, not one universal focus rule. For this form, favor focusing the summary once after a user-initiated submit is blocked, because it exposes the full set and lets a keyboard user choose a field link. The owner should confirm this with keyboard and assistive-technology evaluation. An alternative is first-invalid focus plus a summary available immediately before the fields. [S04, S14, S15]

An asynchronous response that arrives after the reviewer moves must not move focus. Update the persistent inline error and summary; a concise status can say, for example, “The selected decision is no longer available. Review the form errors.” The reviewer can then use the linked summary entry to return. Do not replace/recreate the active input to render an error. Keep textarea selection/caret and tab order stable as messages appear. WCAG's focus-order guidance is about a sequential order that preserves meaning and operation; it does not require focus to jump whenever content changes. [S05, S06]

### Pending, announcements, and save status

Use visible text and a programmatic status for meaningful process milestones: checking, check result, saving, saved, rejected/conflict, and unable-to-confirm outcome. A single status region can work if its message is a current, concise snapshot of the form state and updates only at meaningful transitions. If a validation and save response arrive together, coalesce them into a useful statement instead of emitting a queue of stale announcements. The summary and inline errors remain the durable detail; the live message should not repeat every field's full text.

W3C WCAG 4.1.3 covers status text for waiting, progress, results, and errors when no focus/context change occurs, and explains that status semantics expose changes without taking focus. It warns that excessive live-region chatter can make the experience too interruptive. The APG alert pattern likewise says alerts should not alter focus, should not disappear too quickly, and should be used with awareness of interruption frequency. Keep one status announcement per meaningful phase/result, not one per keystroke or every autosave attempt. An alert is an option for a genuinely important error; it should not be the default for every asynchronous result. [S01, S05]

Keep two separate statements of truth in the UI: validation describes whether this exact choice is acceptable against a particular server version; save status describes whether a particular draft snapshot is durably acknowledged. A green/current validation result must never imply “Saved.” A rejected save and an uncertain transport outcome need explicit visible states. If an asynchronous error arrives in a field the user has left, say which decision/field needs review in the status text while preserving focus.

## Two presentation strategies for asynchronous validation

| Strategy | Presentation/timing | Strength | Cost and boundary |
|---|---|---|---|
| Immediate per-result alerts | Announce each server result as soon as it arrives, often assertively, alongside inline text | Fast signal when an urgent result demands immediate attention | Multiple obsolete/intermediate results can interrupt and duplicate the summary; focus still must not move. APG/WCAG cautions make this unsuitable as the general policy. Use only for an owner-defined urgent condition and verify it with the supported AT matrix. [S01, S05] |
| Coalesced status plus persistent errors | Show a pending marker; on a current result update the inline message and summary, then announce one concise polite status; only focus summary on a user-initiated blocked submit | User can continue working, later find all errors, and choose where to return; stale results can be hidden from presentation | Requires request/revision discipline and a clear summary that remains discoverable. It can delay reading full error detail until the reviewer navigates to it. |

Recommend the second strategy. Keep local format/required checks responsive as input changes, but show messages according to a touched/submitted policy and update an already-visible message when corrected. Run remote policy validation for an intentional decision selection and again at commit against the latest service version; do not issue the same remote check on every unrelated field blur. If product owners prefer blur checks for a particular input, correlate them to that field's captured revision and suppress stale announcements. For especially expensive/slow decision checks, compare change-triggered/debounced validation with submit-only validation in a usability prototype; neither timing should be asserted as a user preference without evidence.

React Aria's current guide is a concrete implementation example: errors are field-keyed, appear when server validationErrors arrive, and clear when a field is modified; the guide also says backend validation is needed for reliability/security and shows native versus aria validation behavior. The rule “clear on modification” is not sufficient on its own when a modified value has not yet been accepted: the old error can be marked stale and a new check started while the dirty value remains intact. The guide does not document response correlation, multi-reviewer conflicts, or interrupted-save reconciliation. [S10]

## Two remote-conflict strategies

1. **Record-level stop and reconcile.** Any failed If-Match or newer canonical version blocks the current save, retains every local dirty field, fetches the latest record, and asks the reviewer to resolve the changed decision before retrying. This is simpler to reason about when the server policy depends on several fields or the dependency map is unknown. It creates more review work when only unrelated fields changed.

2. **Server-described field-level merge.** Refresh clean fields, preserve locally dirty values, and mark overlapping dirty fields as conflicts. The service must identify which other fields/version changes affect the current decision; revalidate that decision against the newest canonical version even if the decision field itself was not edited. This reduces unrelated interruption but requires a precise dependency/merge contract. It must still send If-Match on the final write so a race between refresh and commit is detected. [S09]

Recommend the second only where the service can declare safe field independence and always block/revalidate the decision when a relevant context version changes. Otherwise use record-level reconciliation. In either strategy, offer explicit actions such as “Use current server choice” and “Review my choice again”; do not silently select, overwrite, or submit a stale decision. An explanation or note written by the reviewer is retained until the exact saved revision succeeds.

### Navigation away

A dirty draft needs a deliberate policy. While the form is mounted, preserve it in owner-controlled state and prevent a late response from updating a different request/form. If the user attempts navigation with unsaved edits or an uncertain save, warn and give a return path. Do not treat page-unload/background send as durable save. Whether to store service-request explanations in session/local storage, and for how long, is an owner/privacy decision; no local persistence policy was supplied. If the route changes, a later return should either restore an approved draft revision or clearly start from the last acknowledged server snapshot.

## Layout, language, and focus stability

Retain flexible layout with no fixed heights. At narrow widths and zoom, let field messages and summary links wrap, allow long translated strings to grow vertically, avoid horizontal overflow in ordinary form content, and ensure the current keyboard focus remains visible. WCAG 2.2's reflow explanation describes fitting ordinary page content to a 320 CSS pixel viewport and notes overlap with 200% text resizing; it also notes exceptions for content whose two-dimensional layout is necessary. No such exception is evident for this form. [S07]

Reject the assumption that setting the document's reading direction handles all mixed-direction fields. Set document direction from the chosen interface language. For user-entered notes and other content with unknown direction, use appropriate per-field direction handling such as dir=auto; treat embedded identifiers, URLs, and mixed-script snippets deliberately so they do not reorder surrounding text. Keep source/reading order semantic and use logical layout properties instead of hard-coded left/right mirroring. The W3C direction guidance supports direction markup only; it provides no proof of translation correctness, label expansion coverage, or compatibility with any particular assistive device. Those remain proposed evaluations. [S08]

## Per-clause disposition of the released provisional plan

| Clause | Disposition | Finding and change |
|---|---|---|
| P1.1 — Validate locally while typing | **Revise** | Run inexpensive deterministic checks on input; keep display timing explicit (touched/blurred/submitted) and update an existing error as the value changes. Do not create an announcement on every keystroke. Client validity is provisional, not server authority. [S02, S10] |
| P1.2 — Send a server check whenever a field loses focus | **Revise** | Scope remote policy validation to decision selection/commit or a specifically justified field. A general blur trigger on every field is noisy and does not identify the exact decision/context version checked. If retaining a particular blur trigger, attach request ID, field/value revision, decision revision, and server version. [S09, S10] |
| P1.3 — Put messages beside fields and summarize above submit | **Revise** | Keep inline messages but move the find-all summary to the top of form content. Link each summary message to its field, use matching text, associate inline message programmatically, and expose invalid state. [S02, S14, S15] |
| P1.4 — One live status announces validation completion and save outcomes | **Retain with conditions** | One visible, programmatically exposed status region may summarize meaningful transitions. Coalesce simultaneous events, distinguish check from durable save, and do not update it for each input/save keystroke. Keep error detail persistent in field text and summary. [S01, S05] |
| P1.5 — Field messages plus status are assumed sufficient; research association/order/verbosity/direction | **Reject the sufficiency assumption** | The channels need explicit semantics, stable field associations and summary links, response ordering rules, announcement policy, and correct document/per-field direction. Assess the complete behavior with the proposed keyboard and assistive-technology checks. [S01–S08, S14] |
| P2.1 — A request sequence number discards older responses | **Retain and extend** | Use per-validation generation plus exact submitted value/draft revision/server version. Ignore a stale response even if it arrives last; cancellation alone is not correctness. Do not let a single global counter discard independent field outcomes. |
| P2.2 — Update untouched remote fields and mark edited fields conflicted | **Revise** | Keep the local/remote snapshots separate. Refresh clean fields only when field independence is known; preserve dirty fields and mark overlap. Any newer server context that can affect choice eligibility makes that validation stale and requires recheck. If dependency information is unavailable, treat the record as conflicted. [S09] |
| P2.3 — Keep keyboard position; focus first invalid field after submission | **Retain/revise; owner decision** | Background validation and remote events never move focus. For an explicit blocked submit, choose one intentional recovery route: recommended summary focus with links (GOV.UK pattern) or first-invalid focus with a nearby summary (WAI tutorial). Test and choose once; do not focus a new target for every arriving response. [S04, S05, S14] |
| P2.4 — Unsaved text remains local until successful save clears it | **Retain and refine** | Preserve dirty values/notes after validation rejection, 412 conflict, transport failure, and older save replies. On success, clear only the exact acknowledged snapshot; later edits remain dirty. The public React Spectrum history shows why post-action form reset must be tested. [S11, S12, S15] |
| P2.5 — Research delayed checks, simultaneous save/conflict, and navigation away | **Retain and expand** | Use explicit state transitions and event/version ordering. An uncertain network outcome requires reconciliation; navigation-away handling and local draft retention need a privacy/product decision. ETag equality alone cannot order remote events. [S09, S11, S12] |
| P3.1 — Flexible labels/errors with no hardcoded heights | **Retain** | Also ensure summary, controls, and error text wrap at narrow widths/zoom and remain reachable with keyboard focus. [S06, S07] |
| P3.2 — Document reading direction covers all mixed-language content | **Reject** | Set page direction and handle user-entered/mixed content at field/inline boundaries. Verify identifiers, notes, and links in RTL without claiming translation quality from markup guidance. [S08] |
| P3.3 — Distinguish validation success from durable save success | **Retain and make explicit** | Give validation and persistence separate state and copy. A current-valid choice can still be dirty/unsaved; a successful earlier save does not certify a later edit. [S01, S09, S10] |
| P4.1 — Give retain/revise/reject/unresolved dispositions with primary context | **Retain** | This draft supplies clause dispositions and separates conditions supported by sources from product/service decisions. The unselected toolkit and unprovided server contract remain open. |
| P4.2 — Propose checks for races, missing fields, zoom, navigation, interrupted saves, remote invalidation; separate executed checks | **Retain and expand** | Proposed model/browser/keyboard/zoom/RTL/AT cases appear below. Executed work is listed separately; no portal integration or user-facing compatibility test is claimed. |

## Alternatives, existing coverage, and open points

**Already covered by the proposal:** client and server validation; inline messages; a summary; a live status concept; response ordering; remote changes; keyboard-focus preservation; retaining unsaved text; flexible dimensions; the need to distinguish validation from save; and the named test scenarios.

**Rejected as stated:** one field-wide blur rule for remote checks; assuming field text plus a live region is self-sufficient; focusing the first invalid control as an automatic consequence of every async response; clearing the entire draft after any successful request; treating document direction as sufficient for mixed user text; and treating validation success as durable save success.

**Alternatives:** browser-native constraint checks versus custom field/error-summary rendering; immediate assertive announcements versus a coalesced polite status and persistent details; per-decision change/commit checks versus blur or submit-only checks; record-level conflict reconciliation versus service-described field merge; focus-on-summary versus focus-on-first-invalid after explicit submit. React Aria documents a field-level server-error implementation; GOV.UK documents a summary-and-inline-error implementation. These examples are not a toolkit decision. [S02, S04, S05, S10, S14]

**Unresolved service/owner decisions:**

1. Which exact fields and server data versions determine whether a decision is valid; whether the service can return a monotonic revision and field dependency/merge metadata in addition to ETag.
2. Whether validation occurs on decision change, blur for any specific control, explicit submit, or a hybrid, and the maximum permitted delay for a current result.
3. Whether the form is allowed to remain editable while saving; if so, what snapshot acknowledgments and response fields are returned.
4. The save API's If-Match/412 contract, idempotency support, and how the client reconciles a reply lost after commit.
5. Whether an explicit submit error should focus the summary or first invalid field; test against the portal's supported keyboard and assistive-technology matrix.
6. Whether drafts may persist across navigation/reload and any retention/security constraints for explanatory text and notes.
7. Which messages are localized by the service versus client, and who approves translation/RTL behavior. No translation quality or assistive-device compatibility finding is made here.

## Meaningful proposed validation plan

These cases are proposals, not completed portal checks. Use deterministic service fixtures/fakes to force response order and status outcomes; assert both state invariants and rendered interactions.

| Case | Fixture/trace | Assertions |
|---|---|---|
| Out-of-order validation | Decision A at local rev 4/base server rev 12 starts request 41; reviewer chooses B at rev 5/request 42; B-valid returns first, then A-invalid | B remains current-valid only for rev 5/version 12; response 41 is ignored for visual state and announcements. |
| Response after focus moved | Start a decision check, tab to an explanatory textarea, preserve a mid-string selection, then return a rejection for the prior current decision | Focus remains on the same textarea and selection; the new field error and summary entry appear; status identifies the affected decision; no pointer is needed. |
| All-errors recovery | Server rejects two fields after explicit submit | Summary exposes both as text links; keyboard activation reaches the associated field; each field exposes its own invalid state and description; the selected explicit-submit focus policy runs once. |
| Validation/save separation | Choice validates current; no save has happened | UI communicates valid-but-unsaved, never saved. A successful save for revision 8 followed by local edit revision 9 acknowledges only revision 8 and leaves revision 9 dirty. |
| Server rejection preserves explanation | Submit decision plus multiple explanation fields and notes; server rejects the decision | Keep every local explanation and note verbatim; render decision error and known next step; allow explicit correction/recheck. |
| Stale remote invalidation | Base version 12 validates choice; remote version 13 makes it unavailable while reviewer is elsewhere in form | Mark validation stale, retain draft/focus, show current conflict and recovery link/action, then accept only a new result based on version 13. |
| Save/remote race | Save rev 8 with If-Match ETag A; remote update and save response arrive in both possible orders | Use a monotonic server revision or refetch; never overwrite rev 9 dirty edits or accept an obsolete validation; 412 preserves draft and displays conflict. |
| Interrupted save | Exercise timeout before send and response loss after server commit as distinct fixtures | Before-send failure can be retried after verification; post-send uncertainty stays outcome-unknown until current server state or a supported idempotency key reconciles it; never claim saved/failed prematurely. |
| Navigation away | Dirty draft and saving/unknown state; user attempts route change | Show a keyboard-operable choice to stay/resolve/leave according to owner retention policy; do not treat unload as durable save; no hidden storage is presumed. |
| Narrow/zoom/long labels | 320 CSS pixel viewport, 200% text, long wrapped label/error and expanded summary copy | Ordinary content remains available without two-dimensional page scrolling; controls/messages remain visible and operable; focus is not obscured. |
| Direction and mixed content | LTR and RTL interface direction; user note with mixed-script text and a Latin identifier/URL | Check visual association, reading order, punctuation/identifier containment, summary target and keyboard flow. This is a markup/layout check, not a translation-quality or AT-compatibility claim. |
| Keyboard/status | Complete the same flows by keyboard; trigger several superseded checks while typing | No pointer dependency; focus is stable except the single user-initiated submit route; status announcements correspond to meaningful current transitions, not each keystroke/intermediate result. |

After deterministic integration and browser checks, propose evaluation with the actual supported screen-reader/browser combinations and target languages, including expanded strings and RTL reviewer content. Those tests need the portal implementation, localized strings, supported device/browser matrix, and appropriate human reviewers. None is available or run in this reference stage.

## Checks actually run and limits

- The discovery-release helper ran once at 2026-10-12T04:23:24.342Z. It froze discovery SHA-256 ffbd2cdbec3ff329d76b3c8b886b32a6fe6e9e46bed37b0acdb295537dc2ba81 and revealed the plan with SHA-256 c28298e96002946015ec68ccd6834f18b5fd1878c5811d98ebdd9626c7a71666. This verifies the stage release gate and plan copy, not form behavior.
- Python's JSON parser accepted source-map.json. This checks only the source-map syntax.
- No application code, executable witness, portal, browser, assistive technology, translation, or synthetic state trace was run. All behavioral, integration, accessibility, and multilingual cases above are proposed.

## Source index

The machine-readable evidence record and navigable source IDs are in [source-map.json](source-map.json) and [sources/README.md](sources/README.md). IDs S01–S15 are preserved there with exact URLs, locators, access-time note, operation, version/commit status, conditions, exceptions, and scope. The public failure examples are reports with bounded conditions: React Spectrum #6830 and its #8444 fix are tied to React 19 Actions/RAC 1.3.1; #6983 is an open, unpinned report. They are not generalized into compatibility claims. [S11, S12, S13, S14]
