  - `included_file_paths[]?`
  - `lineage_notes?`
  - `trust_state_at_export?`
- The `trust_state_at_export` field now looks important because earlier research established stale/degraded projection concerns.

### Canonical-vs-derived rule
- This seam reinforces a rule already visible elsewhere:
  - export convenience must not redefine canonical source-of-truth
- Examples:
  - filtered CSV is a view export, not canonical history
  - JSON summary export is not equivalent to canonical record export unless it preserves the exact record envelope
  - monolithic plan-graph export remains derived, never canonical
  - JSONL mirror export is still a projection-derived export, not a replacement for seglog ownership

### Runtime-artifact implication
- `Runtime_Artifacts_Panel.md` provides a good anchor for Orchestrator exports:
  - artifacts should preserve canonical run/thread/attempt linkage
  - receipt-like exports should not invent shadow IDs
  - usage-linked artifacts should continue to route through canonical usage identity
- This means artifact export should remain linked to the exact record/identity model, not become a detached blob dump with lost context.

### Trust / stale-data implication
- Export correctness now depends on the earlier projection-trust work.
- Recommended rule:
  - exports derived from stale/degraded projections must either:
    - disclose trust state in the export/manifest
    - or re-query from canonical/current backing data before export
- Especially for:
  - ledger
  - concerns
  - promotion state
  - graph generation summaries

### Retention / archival implication
- `storage-plan.md` already hints at export for long-term ledger/history retention.
- Good direction:
  - export is part of archival/inspection strategy, not just UI convenience
- This connects to the earlier lane/worktree cleanup work:
  - export may be the reason an otherwise live-retained object can later move toward cleanup
  - but export does not itself authorize deletion of the canonical/historical record model

### Contradictions / gaps surfaced
- Orchestrator still lacks one explicit export contract tying together:
  - records
  - artifacts
  - manifests
  - view exports
  - trust-state disclosure
- Current export language is spread across several domains and could drift into inconsistent semantics.
- There is not yet a sharp rule for when JSON export means:
  - exact record payload
  - filtered table dump
  - convenience summary

### Candidate fixes to carry forward
- Define a shared Orchestrator export taxonomy: `record export`, `bundle export`, `view export`.
- Require manifests for non-trivial bundle exports and likely for some complex record exports.
- Preserve canonical ids/refs in artifact and record exports; do not invent export-local shadow identity.
- Add trust-state disclosure or canonical revalidation requirements for exports built from projections.

### Do-not-forget details
- config bundles, render exports, artifact exports, and Orchestrator record exports are different families and should not be blurred together
- filtered JSON is not automatically a canonical record export
- derived exports stay useful, but they must remain visibly derived

## Research Progress - 2026-03-16 - Notifications / Escalation Interaction with Concerns, Blocked Ownership, and Projection Trust

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/usage-feature.md`
- `Plans/assistant-chat-design.md`
- `Plans/interview-subagent-integration.md`

### Key findings
- The earlier general escalation ladder still fits:
  - `info`
  - `warning`
  - `attention_required`
  - `blocked`
  - `system_notification`
- The current docs already give strong pieces of the behavior:
  - blocked and attention-required stay distinct
  - wizard-blocked cards outrank wizard-attention-required
  - thread badges preserve highest severity and blocked counts
  - usage warnings support thresholds, quiet periods, and clear actions
  - all-nodes-blocked can escalate by elapsed time
- What was still missing was the interaction policy:
  - how concern state influences escalation
  - how blocked-owner influences message routing
  - how stale/degraded trust should suppress or qualify notifications

### Concern interaction direction
- Strong recommendation:
  - concern severity alone should not drive escalation
  - escalation should be based on concern severity + execution impact + persistence + ownership
- Good working rule:
  - advisory concern with no execution effect
    - usually `info` or `warning`
  - concern tied to weak integration but not yet completion-blocking
    - `warning` or `attention_required`
  - concern that blocks seam completion, promotion, or recovery
    - `blocked`
- `acknowledged` concerns should reduce repeat in-app surfacing, but they must not mask an active blocked state if the underlying condition still blocks progress.

### Blocked-owner interaction direction
- Blocked owner now looks like one of the most important routing dimensions.
- Recommended rule:
  - blocked owner influences both destination surface and notification style
- Examples:
  - `User`
    - eligible for thread/chat prompt, Dashboard/Progress CtA, and possibly system notification
  - `Package Overseer` / `Seam Overseer` / `Corroboration`
    - usually operational surfaces first, with user escalation only if persistence or decision need crosses threshold
  - `Runtime` / `Recovery` / `Graph Patch`
    - often Progress/History/Node Graph first; user notification only when action or trust decision is actually needed
  - `External Resource`
    - likely warning/banner first, system notification only if it stalls meaningful progress long enough

### Projection-trust interaction direction
- This seam changed materially after the projection-trust work.
- Important rule:
  - stale or degraded projections must not generate overconfident notifications
- Recommended behavior:
  - if a summary surface is `stale`
    - local in-app indicators may still show, but wording should disclose possible staleness
  - if a surface is `degraded`
    - avoid strong notification claims that rely on incomplete projections
    - prefer notifications rooted in canonical events/blocked records rather than derived rollups
- Example:
  - a degraded concern rollup should not emit a fresh “3 new concerns” system notification unless canonical records support it
  - a canonical blocked event can still drive notification even if some projection surfaces are degraded

### Routing / surface direction
- Good emerging routing model:
  - `History`
    - canonical chronology of everything
  - `Progress` / `Dashboard`
    - active operational attention and grouped counts
  - `thread/chat`
    - direct user-action path when the blocked owner or flow genuinely needs user input
  - `system notification`
    - sparse summon layer for high-value action-needed states
- This means many concern changes should remain in-app only unless:
  - owner is effectively the user
  - blocked persistence crosses threshold
  - new actionable path becomes available

### Resurfacing direction
- The earlier “don’t spam on every heartbeat” rule still stands, but now it needs sharper triggers.
- Good resurfacing triggers:
  - severity increase
  - blocked owner change
  - concern changes from advisory to execution-impacting
  - blocked duration threshold crossed
  - trust state improves enough that previously suppressed actions become available
  - trust state degrades enough that prior assumptions are no longer safe
- Poor resurfacing trigger:
  - unchanged scheduler ticks or repeated identical stale summaries

### Usage / pressure interaction direction
- Usage warnings are the clearest existing example of quiet-window behavior.
- Recommended generalization:
  - pressure/threshold warnings may use quiet periods
  - blocked states and canonical action-needed episodes may not quietly disappear behind the same suppression rule
- This is especially important when usage/account pressure turns into a real blocked execution condition.

### Copy / severity interaction
- Because projection trust now matters, some notification copy needs qualification.
- Good copy patterns:
  - `Warning: provider pressure high`
  - `Blocked: waiting on user approval`
  - `View may be stale; refresh before acting`
  - `Projection degraded; showing canonical history only`
- Bad pattern:
  - a strong imperative or resolved-sounding notification driven from an untrusted summary projection

### Contradictions / gaps surfaced
- Current docs define many notification pieces, but not enough of the interaction policy between concern state, blocked ownership, and projection trust.
- Without this interaction layer, the UI could:
  - over-notify on advisory concerns
  - misroute blocked episodes to the wrong surface
  - emit confident alerts from degraded projections
- The quiet/dismiss model is much clearer for usage warnings than for general operational warnings.

### Candidate fixes to carry forward
- Define notification routing using:
  - severity
  - execution impact
  - blocked owner
  - persistence
  - projection trust
- Keep concern acknowledgment as a noise-control mechanism, not a blocked-state suppressor.
- Allow quiet windows for advisory/pressure warnings, not for canonical blocked episodes that still require action.
- Require degraded/stale disclosure or canonical revalidation before strong notification claims are emitted from projection-heavy surfaces.

### Do-not-forget details
- blocked owner is not just descriptive; it should help decide where and how the user is notified
- projection trust should affect notification confidence, not only action gating
- acknowledged concerns can reduce noise, but they must not create fake health when the runtime is still blocked
