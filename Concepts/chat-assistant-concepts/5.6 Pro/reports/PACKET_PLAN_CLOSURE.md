# Assistant packet and Plans closure ledger

## Authority used

1. Requirements in the current conversation
2. The newest supplied PMConcept7 Usage build
3. The dependency/path/work correction packet
4. The original Creative Bakeoff packet
5. Current live Plans, which predate several final assistant decisions

This concept pass does not rewrite canonical Plans. Stable product requirements and
conflicts are recorded here for later normalization after the user selects the final
component treatments.

## Additional requirements that the earlier concepts had omitted or only implied

| Requirement recovered from the packets or assistant-related Plans | 5.6 Pro concept disposition |
|---|---|
| Worktree selector and visible active worktree | Implemented in the selector row and demo fixtures. |
| Full Goal lifecycle: view, edit, material replanning, pause, resume, stop, clear, tasks, evidence, exact blocker | Implemented in Goal Activity Detail and Goal editor artifact. |
| Per-thread composer drafts and draft restoration | Represented in deterministic thread fixtures and state restoration. |
| Draft revision history | Represented in the message/composer demo states. |
| Exact-message search jump across current, recent, pinned, and archived threads | Implemented in thread search fixtures and history navigation. |
| Edit-and-branch, re-answer, fork lineage, and restore/rewind semantics | Implemented as explicit message/thread actions with explanatory hover text. |
| Offline outbox, reconnect, and exactly-once replay receipt | Included as a dedicated demo thread and triggerable receipt state. |
| Attachment upload progress and unsupported-attachment routing | Included in attachment fixtures and editor/artifact routing demonstrations. |
| Interrupted tool work, recoverable failure, permission denial, checkpoint recovery, and retry | Included as Working Animation and decision fixtures. |
| Provider account identity and route changes | Included in model/provider metadata, message details, and provider-route fixtures. |
| No configured models, temporary model unavailability, authentication failure, and quota exhaustion | Included as deterministic model/provider situations. Unconfigured providers remain absent from the picker. |
| Provider CLI setup must route to Provider Settings rather than install from chat | Preserved as a product constraint; the concept contains no chat-local provider installation. |
| BSD evaluating, silent check, advice, duplicate suppression, timeout, unavailable, and quota-limited states | Included as transcript events and a dedicated BSD thread. |
| Crew formation, child-agent wait/block/timeout/recovery, and completion | Included in Working Animation, Activity Detail, and child-thread fixtures. |
| Context Lens Focus, Mute, staged Subcompact preview/apply/cancel, source provenance, and token delta | Included in the Context Lens menu, receipts, and dedicated thread. |
| Thought Stream Auto/Expanded preference | Included in the capabilities sidecar and Working Animation. |
| Artifact identity, version lineage, stale version, renderer failure, source fallback, retry, and state restoration | Included in artifact fixtures and editor views. |
| Mermaid source/render switching | Implemented in the inline artifact and editor. |
| Interactive visualizer persistence and reopen behavior | Implemented for dashboard, chart, data explorer, quiz, architecture map, periodic table, and flowchart fixtures. |
| Generated-image compact preview and full editor view | Implemented and registered as an artifact. |
| New-message arrival while the reader is away from the bottom, stable scroll anchor, and new-message indicator | Included as a dedicated thread/trigger state. |
| Browser console/network evidence and application/program control/testing | Included as Working Animation phases and test-evidence artifacts. |
| Fast-mode eligibility changes by model | Represented in the model effort/Fast sidecar. |
| Questionnaire queue, required-answer validation, close-and-return, skip, cancel, submit, and no passive expiration | Implemented in the in-flow decision host. |
| Questions, approvals, permission requests, conflict decisions, and Plan review must not obscure transcript content | Implemented in the in-flow decision row directly above the Chat Activity Bar. |
| Plans and Deep Plans need durable transcript cards, editor artifacts, Revise, Approve and Build, Cancel, and later Build | Implemented. Plan is summarized in Activity Detail but is not an Activity Bar domain. |
| Message provenance/details including provider, account, model, effort, persona, mode, timing, tokens, context, cache, cost, turn ID, and terminal reason | Implemented in Message Details. |
| Thread archive search and restore | Implemented in the history rail. |
| Reduced-density and narrow-width fallback without hiding core content | Implemented as responsive full, compact, and transient panel states. |

## Conversation overrides applied

- The work is a modular concept lab, not the original independent-model bakeoff.
- PMConcept7 is the visual and motion foundation rather than a forbidden reference.
- Thread history is pinned on first use and remains user-adjustable.
- The restrained PMConcept7 selected-thread accent is retained.
- Questionnaires have no passive expiry.
- Generic message-level Resend is removed; operations have explicit semantics.
- Accessibility does not affect concept selection or agent tier. Reduced-motion state
  equivalence is retained because it is also a robust animation implementation check.
- Current live Plans rank below both supplied packets because they predate the final
  assistant requirements.
