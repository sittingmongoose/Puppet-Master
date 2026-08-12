# Later Canon, Command, Schema, Wiring, and DRY Update Register

## 1. Purpose

The concept agents must discover and record under-specified or conflicting behavior, but they must not change canonical Plans, command IDs, schemas, wiring, or DRY Method contracts during this exercise.

After a concept is selected, a separate integration and documentation agent will:

- Integrate the selected design into PMConcept7 lineage.
- Update affected Plans.
- Update the UI Command Catalog.
- Update wiring.
- Update schemas and persisted state.
- Update DRY Method disclosure where required.
- Retire stale or conflicting Plan units.
- Add acceptance criteria and validation.

This register contains issues already known before concept work begins.

## 2. Required later updates from explicit user decisions

### Message controls

- Permit Copy to appear only on hover.
- Define the hover row below the message body as the canonical structural relationship.
- Remove Resend.
- Define Edit eligibility and rewind or supersession behavior.
- Remove message-level Stop.
- Define the composer Send/Stop state machine while active work continues.
- Define provider, model, and duration on the user message as metadata for the launched turn.
- Add exact timestamp to More Info.

### Message timing

Define stored fields and display rules for:

- Message sent time.
- Execution start.
- First visible response.
- Terminal time.
- Worked duration.
- Total elapsed.
- Pause and user-wait exclusion from Worked for.
- Localized display from UTC storage.
- Edited, restored, branched, queued, stopped, failed, and cancelled turns.

### Long-message collapse

Add canonical behavior for:

- Eligibility threshold.
- Substantial but bounded preview.
- Hover expand/collapse control.
- Stable manual state.
- Scroll-anchor preservation.
- Complete-message Copy.
- Complete-message search.
- Complete-message Context Lens behavior.
- Search focus inside hidden text.
- Streaming completion behavior.

The exact visual cutoff can remain a presentation token or implementation policy rather than product prose.

### Composer spellcheck and durable revisions

Add:

- Spellcheck requirement.
- Per-thread draft storage.
- Attachment and chip persistence.
- Crash recovery.
- Bounded, deduplicated draft revision history.
- Clear-versus-send behavior.
- Separate questionnaire draft storage.
- Data-retention and privacy limits.

### Search

Define one search surface with:

- Current Thread default.
- All Threads secondary scope.
- Standard popup family.
- Complete stored-history indexing.
- Grouping by thread.
- Cross-thread switching.
- Exact-message restoration.
- Search state restoration across mounts.
- Temporary target highlight.
- Canonical hidden-message search.

### Search and Context Lens

Define:

- Human search over canonical history.
- Agent retrieval over effective shaped history.
- Muted, Focused, and Subcompacted result disclosure.
- Canonical source resolution for Subcompact summaries.
- Duplicate suppression between summary and source.
- Cross-thread Lens-state restoration.

### Context Lens operation bounds

Add:

- Twenty-five-message maximum per selection or Apply operation.
- A separate content-size or token-budget guard for unusually large messages.
- Behavior when the size budget is exceeded.

### Goal Mode presentation

Add or strengthen:

- PMConcept7 demonstration of Goal Mode.
- Goal visibility only when active.
- Expand and collapse behavior.
- View, Edit, Pause, Resume, Stop, Clear, tasks, subgoals, evidence, and logs.
- Exact blocker display.
- Material-edit replan feedback.
- Dynamic coexistence with Todo, subagents, diffs, and activity.
- Temporary visual yielding while a questionnaire is active.

### Dynamic work surfaces

Define that Goal, Todo, subagent, diff, and activity state are separate underlying records even when a presentation combines active portions.

Add behavior for every subset and for transition between subsets.

### Questionnaires

Retire passive expiration and define:

- Per-thread queues.
- Oldest unresolved first.
- One visible questionnaire at a time.
- Composer unavailable while active.
- Exact persistence across navigation, restart, pause, and mount change.
- Per-question Skip.
- Whole-questionnaire Cancel.
- Submit.
- Revisiting a skipped question.
- Required-answer validity.
- Queue advancement.
- Inline completed and cancelled historical records.
- Parent ownership of child-agent questions.

### Subagents

Add or clarify:

- Collapsed aggregate counts.
- One-line task and current activity in expanded state.
- Active status update in place.
- Full-detail destination.
- Durable historical position.
- Group detail page behavior.
- Human-readable label mapping.

### Thought streams

Add:

- Collapsed by default.
- Setting to keep the current permitted stream expanded.
- Automatic collapse when the segment completes.
- Provider-exposed or permitted-summary boundary.
- Historical manual expansion.

### Artifacts and browser previews

Define:

- Inline shortcut remains in the conversation.
- No required active/open treatment.
- Editor-tab opening.
- Project storage and file-explorer access.
- Independence from source-message virtualization.
- Optional related-artifact grouping.
- Browser previews opening in editor tabs.

### Docked and pop-out state

Define mutually exclusive mounts and exact shared-state restoration for:

- Scroll anchor.
- Draft.
- Search.
- Context Lens.
- Questionnaire.
- Goal and work surfaces.
- Selectors.
- Long-message state.
- Thread-history state.

### Widths

Reconcile Assistant Chat width canon with the current PMConcept7 resize range:

- 520 px minimum.
- 1200 px maximum.

The 750 and 975 px values are reproducible concept-test presets, not necessarily production snap points.

### Thread selection

Retire current left-side colored accent-bar requirements in `ACD-444` and `F3-469` and replace them after a concept is selected.

### Human-readable display strings

Add a presentation rule that internal underscored enum values are mapped to readable labels. Underscores remain acceptable in literal file names and diagnostic identifiers where intentionally shown.

## 3. Known command-catalog work

### Questionnaire commands

Current named but uncataloged or incomplete family:

- `cmd.questionnaire.draft_update`
- `cmd.questionnaire.submit`
- `cmd.questionnaire.dismiss`
- `cmd.questionnaire.resume`
- `cmd.questionnaire.expire`
- `cmd.questionnaire.mark_unavailable`

Later work must replace stale semantics and establish the final command or event set for:

- Draft update.
- Navigate question.
- Skip question.
- Submit questionnaire.
- Cancel questionnaire.
- Restore persisted questionnaire.
- Queue advance.

Passive Expire should be retired.

### Thread lifecycle namespace

Reconcile the internal `cmd.chat.thread.*` lifecycle family with public `cmd.chat.*` actions. Determine:

- Which are commands.
- Which are domain events.
- Which are aliases.
- Which are stale.
- Which need UI dispatch receipts.

### Investigation and child-question commands

Canonicalize:

- Child-question context viewing.
- Investigation target opening.
- Investigation bundle export.
- Investigation item revocation.

### Long-message actions

Determine whether expand/collapse is:

- Pure local view state.
- A cataloged command.
- A persistent thread-view preference.

### Draft-history recovery

Define command and persistence ownership for:

- Open revision history.
- Restore revision.
- Delete or clear revision.
- Clear current draft.

### Dynamic work-surface actions

Confirm command ownership when a visual concept combines Goal, Todo, subagent, diff, or activity controls. Combining presentation must not create ambiguous dispatch ownership.

## 4. Known schema work

Later schema updates may be needed for:

- Message timestamp set.
- Worked duration and total elapsed.
- Effective provider and model per turn.
- Edit eligibility and supersession lineage.
- Long-message local expansion state.
- Search scope and selected result restoration.
- Context Lens active selection and applied-state restoration.
- Goal expansion state.
- Dynamic surface expansion state.
- Questionnaire queue and cancellation result.
- Per-question skipped state.
- Draft revision history.
- Subagent aggregate counts and current-activity summary.
- Thought-stream current-expansion setting.
- Artifact project path and editor-tab target.
- Browser-preview editor-tab target.

## 5. Known wiring work

The final design must later be mapped to:

- Command registrations.
- Command handlers.
- State owners.
- Persistence owners.
- Event receipts.
- Docked/pop-out remount behavior.
- Editor-tab routing.
- Search-index calls.
- Context Lens assembly.
- Goal Runtime projection.
- Orchestrator child-run projection.
- UsageRecord projection.

The prototype agent should not pretend these are already wired if the catalog does not support them.

## 6. DRY Method work

A later agent must review combined or routed presentations for DRY disclosure.

Potential cases:

- A shared visual surface containing Goal, Todo, subagent, diff, and activity data owned by different systems.
- Chat controls that route to editor, browser, Context Detail, Goal evidence, or child-run detail.
- A displayed state that is a projection rather than the owning record.

The later update should make ownership and route behavior understandable without duplicating the authoritative data.

## 7. Older contracts to retire or reconcile

- Hover-independent Copy acceptance text.
- Resend control.
- Left-side accent bars.
- Passive questionnaire expiration.
- Older four-state child vocabulary.
- Older 5,000-message soft-cap text where it conflicts with newer stored-history behavior.
- Older Persona-inline popup wording where it conflicts with the newer shared popup contract.
- Any PMConcept7 label that exposes internal underscores.
- Any artifact/browser wording that routes these previews somewhere other than editor tabs.

## 8. Required gap report from each concept agent

Each concept folder must contain a structured gap report with:

- Gap ID.
- Feature or component.
- Description.
- Evidence source.
- Current PlanUnit or command reference when known.
- Whether the issue is missing, conflicting, stale, ambiguous, or implementation-only.
- Impact on the prototype.
- Suggested later owner document or command family when evident.
- Whether the concept made a provisional prototype-only assumption.

The report must not edit or silently resolve canon.
