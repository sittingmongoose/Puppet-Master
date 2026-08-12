# Plans Canon, Relevant Sources, Conflicts, and Supersessions

## 1. Purpose

This document reduces the large Plans corpus to the chat-related ownership and conflict information needed for this concept exercise.

The complete machine-readable records for the relevant PlanUnits are in `machine/relevantPlanUnits.json`.

The concept agents should verify the named owner sections and current PMConcept7 behavior as needed. They should not repeat the full 671-file research pass and should not update Plans.

## 2. Primary internal sources

### `Plans/assistant-chat-design.md`

Primary owner for:

- Message behavior and controls.
- Questions and questionnaires.
- Plan and Todo behavior.
- Thread lifecycle and search.
- Tool and activity cards.
- Subagent projection.
- Context Lens.
- Long-thread rendering.
- Goal Mode chat projection.
- Context Ring and Context Detail entry behavior.
- Selector rows and popup motion.
- Chat-header menus.

### `Plans/FinalGUISpec.md`

Primary or shared owner for:

- Shared Assistant Chat component across docked, floating, and wizard mounts.
- GUI themes and token families.
- Popup portals and app-wide motion behavior.
- Context and Usage value-state rendering.
- Side-panel and floating-chat geometry.
- Message information surfaces.
- Plan/Todo presentation.
- DRY Method visible state.
- Thread-history rail geometry and shared GUI behavior.
- Draft restoration.

### `Plans/Goal_Runtime_System.md`

Owner for:

- Goal lifecycle.
- Durable Goal state.
- Pause, resume, stop, clear, edit, update, and replan semantics.
- Task and subgoal state.
- Evidence, receipts, and exact blockers.

### `Plans/orchestrator-subagent-integration.md`

Owner for:

- Child-run lifecycle.
- Parent and child projection.
- Crew and subagent orchestration behavior.
- Parent-mediated questions.

### `Plans/UI_Command_Catalog.md`

Owner for cataloged UI command IDs.

### `Plans/UI_Wiring_Rules.md`

Owner for command registration, handler ownership, aliases, and fail-closed behavior.

### `Concepts/PMConcept7.html`

Current concept evidence. It is useful for:

- The Tastebook message hover-row structure.
- Existing themes.
- Current chat widths and resize behavior.
- Current thread-history and pop-out behavior.
- Existing selectors, menus, cards, Todo, subagent, question, diff, activity, and Context Lens demonstrations.

It is not canonical product authority and is not a required visual template.

### `Concepts/rail-concepts/README.md`

Behavioral reference for the comparison workspace:

- All concepts visible together.
- Shared theme broadcast.
- Shared width controls.
- Interactive iframe concepts.
- Reduced-motion broadcast.
- Automated configuration sweeps plus visual inspection.

Its old width values and left-side selected accent markers are not carried into this assignment.

## 3. Relevant PlanUnit families

### Messages and queue behavior

- `ACD-012` — message controls and queue semantics.
- `F3-132` — under-message actions and message information surfaces.

### Question and questionnaire flow

- `ACD-027` through `ACD-031`.
- `ACD-433` for residual questionnaire mechanics.

### Plan and Todo

- `ACD-032` through `ACD-047`.
- `F3-319` through `F3-321`.

### Search, threads, history, branching, and restoration

- `ACD-061` through `ACD-075`.
- `ACD-086` through `ACD-090`.

### Activity and tool transparency

- `ACD-100` through `ACD-108`.
- `ACD-119` through `ACD-129`.
- `ACD-221` — unified thought stream.
- `ACD-241` — lazy collapsed content.

### Subagents

- `ACD-151` through `ACD-168`.

### Context Lens

- `ACD-192` through `ACD-195`.

### Very long threads

- `ACD-236` — virtualized message list.
- `ACD-241` — lazy collapsed content.
- `F3-422` — footer and jump-to-latest geometry.

### Artifact and target routing

- `ACD-297` — bridge and host semantics.
- `ACD-410` — internal target payload navigation.

### Goal Mode

- `ACD-416` through `ACD-420`.
- Relevant Goal Runtime units: `GRS-002`, `GRS-005`, `GRS-006`, `GRS-007`, `GRS-012`, `GRS-014`, and `GRS-019`.

### Context, Usage, selectors, and popups

- `ACD-425` — vision bridge controls.
- `ACD-429` — DRY Method what-and-why disclosure.
- `ACD-434` — Context Detail and UsageRecord projection.
- `ACD-437` through `ACD-442` — selector order, effort chaining, sprout motion, Context Ring, and header popup chrome.
- `F3-406` — DRY Method visible state.
- `F3-417` — platform renderer and SVG/icon contract.
- `F3-418` — Usage value state and identity.
- `F3-420` — shared chat component and mount flags.
- `F3-423` and `F3-424` — composer, floating-chat floor, popup portals, and motion.

### Thread rail and widths

- `ACD-444` — current Chats rail behavior.
- `F3-469` — current rail presentation and resize collapse.
- `F3-471` and `F3-498` — current side-panel width envelope.

## 4. Current canonical behavior retained for the concepts

### Shared component identity

`F3-420` requires one shared Assistant Chat component and one thread state source across docked, floating, and wizard-embedded mounts. The prototype concepts can vary presentation but should not treat docked and pop-out chat as unrelated data systems.

### Selector row

`ACD-437` locks Persona, Model, and Mode as the peer selector order. Worktree follows. A separate standing provider selector is not required. Effective provider and model remain visible in runtime metadata.

`ACD-438` chains reasoning effort through Model and keeps it distinct from Plan Thoroughness.

### Popup behavior

`ACD-439` through `ACD-442` establish click-to-open corner-origin sprout behavior, in-place resizing, reduced-motion behavior, shared popup chrome, and one active transient overlay.

### Context Lens data semantics

`ACD-192` through `ACD-195` establish Mute, Focus, Subcompact, Turn Off, multi-message selection, canonical source retention, and thread-local shaping.

### Long-thread technical behavior

`ACD-236` and `ACD-241` establish stable message IDs, virtualization, lazy collapsed contents, scroll-anchor preservation, older-history paging, full stored history, exact-message jumps, and no forced auto-scroll when the user has moved upward.

### Subagent truth

`ACD-151` through `ACD-168` require every child run to remain represented in the parent thread, preserve durable status and result information, support grouped fanout, and route child questions through the parent.

### Goal truth

`ACD-416` through `ACD-420` require visible Goal activation, durable state, status, control actions, task projection, replan feedback, evidence, completion reporting, and child-goal projection without making Assistant Chat the Goal Runtime owner.

### Usage truth

`ACD-434` and `F3-418` require Context Ring, Context Detail, and Usage surfaces to consume the same UsageRecord projection. The chat concept must not invent a second usage-accounting model.

## 5. Explicit user supersessions for this exercise and later canon update

The following user decisions override older or conflicting text. The concept agents implement these behaviors in their prototypes but do not edit Plans.

### Copy may be hover-only

`ACD-012` previously required Copy not to depend on hover-only discovery. The user has explicitly superseded that rule. The message hover row may reveal Copy on hover.

### Resend is retired

The current PMConcept7 user-message row includes Resend. It is removed. Edit replaces the resend workflow.

### Edit is conditional

Edit appears only when a user message can still be safely edited. It is the only hover-row control whose presence is conditional.

### Stop belongs to the composer

Stop is not a per-message action. The composer Send button becomes Stop while the agent works and the composer is empty. Typing changes it back to Send.

### Message timestamp moves into More Info

The compact row shows provider, model, and worked duration. Exact timestamp is added to More Info.

### Left-side colored accent borders are prohibited

`ACD-444` and `F3-469` currently require left accent bars for active or selected thread rows. That presentation is retired for this concept work and must later be updated in canon.

### Newer vocabulary and contracts win

Where an older Plan unit and a newer, more specific unit disagree, use the newer version and record the older one for retirement.

Examples include:

- Newer child status vocabulary over older four-state wording.
- Newer no-hard-persistence-cap long-thread behavior over older 5,000-message soft-cap text.
- Newer shared popup contract over older Persona-inline wording.

### Questionnaire expiration is retired

Unresolved questionnaires do not expire passively. They persist until Submit, per-question Skip as part of eventual completion, or whole-questionnaire Cancel.

### Questionnaire queue is oldest-first and per thread

Only the oldest unresolved questionnaire for the active thread is visible. Other threads retain their own queues.

### Artifacts and browser previews open in editor tabs

The inline artifact remains in the conversation and the project. Browser previews also open in editor tabs.

### Docked and pop-out forms are mutually exclusive

Only one mount exists at a time. It remounts from the same semantic and view state.

### Context Lens operation limit

A single Context Lens Apply operation supports up to 25 messages. Multiple operations can accumulate.

### Human search and agent retrieval differ

Human search sees canonical history regardless of Context Lens shaping. Agent retrieval respects the effective shaping state.

### Width test points

Use 520, 750, 975, and 1200 px for the concept matrix.

## 6. Confirmed command and wiring defects

These issues must be included in the agent's gap report. They are not to be fixed during concept work.

### Questionnaire command IDs absent from the command owner

The Assistant Chat plan names:

- `cmd.questionnaire.draft_update`
- `cmd.questionnaire.submit`
- `cmd.questionnaire.dismiss`
- `cmd.questionnaire.resume`
- `cmd.questionnaire.expire`
- `cmd.questionnaire.mark_unavailable`

The reviewed UI Command Catalog and production Wiring Matrix do not contain that complete family.

Later canon work must:

- Remove the passive-expire behavior.
- Define Submit, per-question Skip, whole-questionnaire Cancel, persistence, and queue advancement.
- Decide which operations are UI commands versus internal events.
- Register and wire the final IDs.

### Thread lifecycle namespace inconsistency

The Assistant Chat plan uses lifecycle IDs such as:

- `cmd.chat.thread.commit_first_message`
- `cmd.chat.thread.discard_empty_draft`
- `cmd.chat.thread.suspend`
- `cmd.chat.thread.restore`
- `cmd.chat.thread.archive`
- `cmd.chat.thread.unarchive`
- `cmd.chat.thread.delete`

The command catalog uses a shorter user-action family such as:

- `cmd.chat.new`
- `cmd.chat.archive`
- `cmd.chat.delete`
- `cmd.chat.rename`
- `cmd.chat.pin`
- `cmd.chat.export`
- `cmd.chat.search`

Later work must distinguish internal state transitions, public commands, aliases, and stale names.

### Investigation and subagent command drift

The Assistant Chat plan references IDs including:

- `cmd.chat.subagent_question.view_context`
- `cmd.investigation_context.open_target`
- `cmd.investigation_context.export_bundle`
- `cmd.investigation_context.revoke_item`

The catalog describes differently named chat-scoped investigation actions. Later work must canonicalize them.

### UI Wiring Rules fail closed

The wiring rules require uncataloged, multiply registered, or handlerless commands to fail closed. A concept may demonstrate behavior, but it must not imply that an uncataloged command is already production-wired.

## 7. Confirmed under-specification relevant to design

### Readability and information priority

The Plans do not currently define:

- A minimum readable conversational text width.
- Which information yields first as width decreases.
- A maximum default metadata density around messages.
- A limit on nested surface depth.
- A limit on simultaneously expanded secondary content.
- Whether consecutive messages group.
- A measurable conversation-parseability criterion.

This is intentionally design-driven in the concept exercise.

### Unified activity lifecycle

The Plans define individual cards and collapsible content but do not fully define:

- One changing live activity region.
- How completed stages condense.
- Historical grouping.
- Active and final duration treatment.
- Interrupted, blocked, resumed, superseded, or cancelled activity.

This is design-driven, using the activity video only as functional evidence.

### Goal, Todo, subagent, diff, and activity relationship

The schemas exist. Their visual relationship does not. It is design-driven.

### Questionnaire presentation

The data lifecycle exists, but the exact presentation, transitions, narrow-width treatment, history compaction, and queued-flow display are incomplete. The user's later decisions in `01_FIXED_REQUIREMENTS.md` settle lifecycle behavior while leaving presentation open.

### Search scope experience

The user's one-bar, two-scope behavior in `01_FIXED_REQUIREMENTS.md` settles the previously incomplete experience.

### Message timing

The old Plans contain duration fields for tools, terminal work, and subagents but no one complete every-message timestamp and work-duration contract. `01_FIXED_REQUIREMENTS.md` supplies the intended later canon.

### Draft revision history and spellcheck

The existing GUI contract restores current unsent chat text and persists questionnaire drafts. It does not fully define bounded composer revision history or spellcheck. Those are new later-canon requirements.

### Artifact handoff presentation

Target routing exists, but the exact inline shortcut and editor-tab behavior was incomplete. The user decisions in `01_FIXED_REQUIREMENTS.md` settle it for the prototype.

## 8. Concurrent-work boundary

The Usage-page redesign owns:

- The detailed Context Ring dropdown redesign.
- The Context Detail or More Details destination.
- Usage-record presentation and calculations.

The chat concepts preserve entry points and state relationships without re-owning that work.

## 9. DRY Method boundary

`ACD-429` and `F3-406` define the DRY Method what-and-why disclosure when shared ownership, routing, or mutation affects user trust.

The concept agent may discover that new combined or routed surfaces need DRY disclosure. It records the impact in its gap report. It does not update DRY Method contracts.

## 10. Concept-agent document behavior

The agent may read relevant Plans and source code. It must not:

- Edit canonical Plans.
- Register commands.
- Update schemas.
- Update wiring.
- Modify DRY Method contracts.
- Modify PMConcept7.
- Treat the prototype as new product canon.

It should write a structured `SPEC_GAPS.md` or equivalent inside its own concept folder, containing evidence, source references, and later-update notes.
