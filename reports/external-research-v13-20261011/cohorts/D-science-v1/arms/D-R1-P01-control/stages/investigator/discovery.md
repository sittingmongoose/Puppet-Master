# Initial discovery — D-R1-P01-control investigator

Basis: the released software brief and the primary sources indexed in sources/index.md. This is the initial discovery snapshot; the exact plan has not yet been released or read.

## Findings with direct bearing

1. **Keep validation and authority separate.** Browser/client checks can catch basic required or shape errors near entry and improve response time. They are bypassable, so the server must repeat the checks and decide whether a decision remains allowable. A server response only describes the submitted snapshot and resource version; it is not a guarantee that the choice remains valid at a later write. [S01, S07, S08]

2. **Associate, summarize, and preserve errors.** Render each detected field error as text next to its field, expose invalid state only after an actual check fails, and programmatically associate the explanation with that control. Keep a persistent summary with a link to every affected control and consistent wording with inline errors. Use text labels/symbols as well as any color. This makes the whole set discoverable and offers an explicit return path without requiring a pointer. [S01, S03, S04, S10, S14]

3. **Treat status and focus as separate channels.** A pending check, save completion, or conflict is a status when it is added without changing context; expose a concise message through an appropriate status role/property so assistive technology can receive it without focus. Announce state changes at meaningful checkpoints (a decision check, save start/completion, conflict), not each character. Keep persistent text for later review. Preserve the current keyboard target when a delayed answer arrives; allow the reviewer to activate the summary or a “review errors” control to move intentionally. GOV.UK’s summary-focus behavior is useful for a conventional post-submit response, but this brief’s delayed response after a reviewer has moved requires a focus guard. WAI warns that live regions can become chatty and calls for user testing. [S02, S04, S10, S12, S13]

4. **Correlate every asynchronous answer to the exact snapshot.** Each check request should carry a request ID, local field revision, decision value, and server resource version. On edit, increment the local revision. Discard a response whose request ID or captured revision is no longer current; it may not clear errors, mark the choice valid, or overwrite local text. A latest-only policy is straightforward, but cancelling the browser request alone cannot establish that the server did not process it. [S07, S09]

5. **Use conditional writes for concurrent reviewers.** Read a server revision or ETag with the request. Submit a decision against that revision using If-Match (or an equivalent server-enforced compare-and-set contract). If the precondition fails, do not apply the write: fetch current state, mark the local decision stale, show what changed, and ask the reviewer to revalidate/resolve. Do not merge over the decision or explanatory text automatically. If the service cannot expose a revision, that is an API/owner choice, not a front-end assumption. [S09]

6. **Represent save certainty honestly.** Track unsaved fields and the exact snapshot being saved. On success, mark only that snapshot saved; later edits stay dirty. A connection loss or timeout can leave the outcome unknown, so retain the draft and do not say “Saved” until a reconciliation query or same-key retry confirms it. An idempotency/status-query contract is a proposed backend capability, not supplied by the sources or brief. [S02, S09]

7. **Design for language and viewport expansion.** Keep semantic source order, normal-flow summary/error/status content, wrapping labels and messages, and a single-column form at narrow widths. Prefer direction-aware layout properties; set interface direction from the selected locale, and reserve dir=auto for text whose direction is genuinely unknown. Test long localized strings, 200% text size and WCAG 2.2 reflow at 320 CSS px. Neither standards nor this discovery claim any translation quality or screen-reader/locale combination compatibility. [S01, S05, S06]

## Alternatives worth keeping open

- **Check before enabling an action:** after a choice is committed or a field is left, submit one asynchronous server check with the captured revision, show a pending status, and only mark the snapshot current if it still matches. It gives early feedback and reduces avoidable failed writes, but adds requests and races. The final save still needs an atomic server revision check.
- **Check on explicit submit/save:** client checks may catch local syntax, then the server validates the submitted snapshot and returns structured field errors or acceptance. This reduces background traffic and provides a clear checkpoint, but makes feedback slower and still requires stale-response filtering and an If-Match write.
- For remote changes, a push/poll notice is more timely but adds subscription/state complexity; save-time compare-and-set is simpler and mandatory even with notifications. In either case, remote data must not overwrite locally dirty explanation text.

## History and limits

GOV.UK Design System provides a maintained summary-plus-inline example; its current guidance expects summary focus and matching error links. Public history documents a focus mismatch in a legacy page traced to missing example JavaScript, fixed and retested in 2019, plus a 2023 audit case where a summary anchor ID did not match its input. These reports support explicit focus and link-target checks; they do not demonstrate current compatibility in the portal. [S10–S14]

## Proposed validation themes

Exercise request reordering, edits during pending checks, remote revision changes before commit, 412 handling, late save success after local edits, timeout/unknown outcome, exact preservation of notes, and keyboard focus after delayed errors. Verify every summary link, inline association, keyboard-only operation, textual error affordance, 200% text, 320 CSS px reflow, and long LTR/RTL labels. Run manual assistive-technology sessions only against an actual integrated build and recorded browser/AT versions. Portal integration, language review, and multilingual usability/AT testing remain proposed.
