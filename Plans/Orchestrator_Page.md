# Orchestrator Page -- Single-Page 6-Tab Specification

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-003: Owner-first fidelity recovery order
- Coverage rows: cov-003
- Fidelity gap refs: cov-003
- Required fidelity items:
- Exact required item: Apply owner-doc corrections before consumer and mirror cleanup
- Exact required item: Rerun fidelity audit only after owner and consumer corrections are in place
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-003: Owner-first fidelity recovery order` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-003` repair states the exact requirement: Apply owner-doc corrections before consumer and mirror cleanup
- Exact acceptance check: The `cov-003` repair states the exact requirement: Rerun fidelity audit only after owner and consumer corrections are in place
- Exact acceptance check: The `cov-003` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-015: Shared governance/runtime record envelope
- Coverage rows: cov-015
- Fidelity gap refs: cov-015
- Required fidelity items:
- Exact required item: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact required item: Keep record objects distinct from artifacts and rendered summaries
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-015: Shared governance/runtime record envelope` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-015` repair states the exact requirement: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact acceptance check: The `cov-015` repair states the exact requirement: Keep record objects distinct from artifacts and rendered summaries
- Exact acceptance check: The `cov-015` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-021: Concern record family definition
- Coverage rows: cov-021
- Fidelity gap refs: cov-021
- Required fidelity items:
- Exact required item: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact required item: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-021: Concern record family definition` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-021` repair states the exact requirement: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact acceptance check: The `cov-021` repair states the exact requirement: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Exact acceptance check: The `cov-021` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-024: Concern lifecycle and resolution kinds
- Coverage rows: cov-024
- Fidelity gap refs: cov-024
- Required fidelity items:
- Exact required item: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact required item: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-024: Concern lifecycle and resolution kinds` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-024` repair states the exact requirement: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact acceptance check: The `cov-024` repair states the exact requirement: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Exact acceptance check: The `cov-024` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-026: Concern routing and object-first search behavior
- Coverage rows: cov-026
- Fidelity gap refs: cov-026
- Required fidelity items:
- Exact required item: Concern search results must route as object-first results with focused-run and target-tab context
- Exact required item: Concern drill-downs must preserve selected concern id and related object context
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-026: Concern routing and object-first search behavior` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-026` repair states the exact requirement: Concern search results must route as object-first results with focused-run and target-tab context
- Exact acceptance check: The `cov-026` repair states the exact requirement: Concern drill-downs must preserve selected concern id and related object context
- Exact acceptance check: The `cov-026` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-028: Concern action policy and authority model
- Coverage rows: cov-028
- Fidelity gap refs: cov-028
- Required fidelity items:
- Exact required item: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact required item: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-028: Concern action policy and authority model` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-028` repair states the exact requirement: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact acceptance check: The `cov-028` repair states the exact requirement: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Exact acceptance check: The `cov-028` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-031: Concern linkage to adjacent families
- Coverage rows: cov-031
- Fidelity gap refs: cov-031
- Required fidelity items:
- Exact required item: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact required item: Allow blocked episodes to reference concerns without replacing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-031: Concern linkage to adjacent families` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-031` repair states the exact requirement: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact acceptance check: The `cov-031` repair states the exact requirement: Allow blocked episodes to reference concerns without replacing concern identity
- Exact acceptance check: The `cov-031` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-035: Promotion classes and gate evidence
- Coverage rows: cov-035
- Fidelity gap refs: cov-035
- Required fidelity items:
- Exact required item: Define lane_to_package, package_to_seam_available, and seam_complete promotions
- Exact required item: Attach exact gate/evidence expectations to each promotion class
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-035: Promotion classes and gate evidence` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-035` repair states the exact requirement: Define lane_to_package, package_to_seam_available, and seam_complete promotions
- Exact acceptance check: The `cov-035` repair states the exact requirement: Attach exact gate/evidence expectations to each promotion class
- Exact acceptance check: The `cov-035` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-037: Focused run and historical routing contract
- Coverage rows: cov-037
- Fidelity gap refs: cov-037
- Required fidelity items:
- Exact required item: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact required item: Keep cross-tab deep links and search pivots coherent on the focused run
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-037: Focused run and historical routing contract` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-037` repair states the exact requirement: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact acceptance check: The `cov-037` repair states the exact requirement: Keep cross-tab deep links and search pivots coherent on the focused run
- Exact acceptance check: The `cov-037` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-042: Source Control and worktree handshake
- Coverage rows: cov-042
- Fidelity gap refs: cov-042
- Required fidelity items:
- Exact required item: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact required item: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-042: Source Control and worktree handshake` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-042` repair states the exact requirement: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact acceptance check: The `cov-042` repair states the exact requirement: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Exact acceptance check: The `cov-042` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-046: Projection trust and action gating
- Coverage rows: cov-046
- Fidelity gap refs: cov-046
- Required fidelity items:
- Exact required item: Use current/refreshing/stale/degraded/unavailable projection states
- Exact required item: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-046: Projection trust and action gating` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-046` repair states the exact requirement: Use current/refreshing/stale/degraded/unavailable projection states
- Exact acceptance check: The `cov-046` repair states the exact requirement: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Exact acceptance check: The `cov-046` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-049: Progress-only widget hostability
- Coverage rows: cov-049
- Fidelity gap refs: cov-049
- Required fidelity items:
- Exact required item: Restrict widget-composed Orchestrator surface to Progress
- Exact required item: Persist orchestrator:progress layout separately from Dashboard and Usage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-049: Progress-only widget hostability` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-049` repair states the exact requirement: Restrict widget-composed Orchestrator surface to Progress
- Exact acceptance check: The `cov-049` repair states the exact requirement: Persist orchestrator:progress layout separately from Dashboard and Usage
- Exact acceptance check: The `cov-049` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-051: Shared escalation ladder
- Coverage rows: cov-051
- Fidelity gap refs: cov-051
- Required fidelity items:
- Exact required item: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact required item: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-051: Shared escalation ladder` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-051` repair states the exact requirement: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact acceptance check: The `cov-051` repair states the exact requirement: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Exact acceptance check: The `cov-051` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-056: Action-surface policy
- Coverage rows: cov-056
- Fidelity gap refs: cov-056
- Required fidelity items:
- Exact required item: Default bulk actions to navigation and triage rather than live execution mutation
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-056: Action-surface policy` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-056` repair states the exact requirement: Default bulk actions to navigation and triage rather than live execution mutation
- Exact acceptance check: The `cov-056` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-063: Glossary and help governance
- Coverage rows: cov-063
- Fidelity gap refs: cov-063
- Required fidelity items:
- Exact required item: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact required item: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-063: Glossary and help governance` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-063` repair states the exact requirement: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact acceptance check: The `cov-063` repair states the exact requirement: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Exact acceptance check: The `cov-063` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-068: Notification routing policy
- Coverage rows: cov-068
- Fidelity gap refs: cov-068
- Required fidelity items:
- Exact required item: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact required item: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-068: Notification routing policy` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-068` repair states the exact requirement: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact acceptance check: The `cov-068` repair states the exact requirement: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Exact acceptance check: The `cov-068` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-078: Project summary projection
- Coverage rows: cov-078
- Fidelity gap refs: cov-078
- Required fidelity items:
- Exact required item: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact required item: Give canonical blocked episodes precedence over weaker derived warnings
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-078: Project summary projection` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-078` repair states the exact requirement: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact acceptance check: The `cov-078` repair states the exact requirement: Give canonical blocked episodes precedence over weaker derived warnings
- Exact acceptance check: The `cov-078` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-081: Project attention projection
- Coverage rows: cov-081
- Fidelity gap refs: cov-081
- Required fidelity items:
- Exact required item: Define project_attention_item with primary route payload and projection trust disclosure
- Exact required item: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-081: Project attention projection` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-081` repair states the exact requirement: Define project_attention_item with primary route payload and projection trust disclosure
- Exact acceptance check: The `cov-081` repair states the exact requirement: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Exact acceptance check: The `cov-081` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-093: Account switch and pressure history
- Coverage rows: cov-093
- Fidelity gap refs: cov-093
- Required fidelity items:
- Exact required item: Add append-only account_pressure_episode and account_switch_event families
- Exact required item: Let Usage, History, Ledger, and Orchestrator consume the same durable event family
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-093: Account switch and pressure history` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-093` repair states the exact requirement: Add append-only account_pressure_episode and account_switch_event families
- Exact acceptance check: The `cov-093` repair states the exact requirement: Let Usage, History, Ledger, and Orchestrator consume the same durable event family
- Exact acceptance check: The `cov-093` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-165: Coverage blocker concern lifecycle owner section
- Coverage rows: cov-165
- Fidelity gap refs: cov-165
- Required fidelity items:
- Exact required item: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact required item: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-165: Coverage blocker concern lifecycle owner section` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-165` repair states the exact requirement: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact acceptance check: The `cov-165` repair states the exact requirement: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Exact acceptance check: The `cov-165` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-174: Concern owner vs creator vs resolver separation
- Coverage rows: cov-174
- Fidelity gap refs: cov-174
- Required fidelity items:
- Exact required item: Separate concern owner_kind/owner_ref from created_by_kind/created_by_ref and resolver authority
- Exact required item: Allow ownership changes without changing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-174: Concern owner vs creator vs resolver separation` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-174` repair states the exact requirement: Separate concern owner_kind/owner_ref from created_by_kind/created_by_ref and resolver authority
- Exact acceptance check: The `cov-174` repair states the exact requirement: Allow ownership changes without changing concern identity
- Exact acceptance check: The `cov-174` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-177: Concern source-event vs record vs projection split
- Coverage rows: cov-177
- Fidelity gap refs: cov-177
- Required fidelity items:
- Exact required item: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-177: Concern source-event vs record vs projection split` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-177` repair states the exact requirement: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Exact acceptance check: The `cov-177` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-178: Dismissed vs resolved rationale enforcement
- Coverage rows: cov-178
- Fidelity gap refs: cov-178
- Required fidelity items:
- Exact required item: Require distinct dismissal rationale and resolution rationale rules
- Exact required item: Treat accepted_risk as a resolution path rather than dismissal
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-178: Dismissed vs resolved rationale enforcement` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-178` repair states the exact requirement: Require distinct dismissal rationale and resolution rationale rules
- Exact acceptance check: The `cov-178` repair states the exact requirement: Treat accepted_risk as a resolution path rather than dismissal
- Exact acceptance check: The `cov-178` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-192: Concern update heuristics
- Coverage rows: cov-192
- Fidelity gap refs: cov-192
- Required fidelity items:
- Exact required item: Use source/scope/category/lineage-aware heuristics when deciding whether repeated sightings update an existing concern or create a new one
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-192: Concern update heuristics` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-192` repair states the exact requirement: Use source/scope/category/lineage-aware heuristics when deciding whether repeated sightings update an existing concern or create a new one
- Exact acceptance check: The `cov-192` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-195: Help entry template and related-concept clusters
- Coverage rows: cov-195
- Fidelity gap refs: cov-195
- Required fidelity items:
- Exact required item: Define a dedicated help-entry template and related-concept linking clusters
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-195: Help entry template and related-concept clusters` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-195` repair states the exact requirement: Define a dedicated help-entry template and related-concept linking clusters
- Exact acceptance check: The `cov-195` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-196: Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Coverage rows: cov-196
- Fidelity gap refs: cov-196
- Required fidelity items:
- Exact required item: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-196: Blocked-owner eight-kind taxonomy and escalation ladder surfaces` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-196` repair states the exact requirement: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Exact acceptance check: The `cov-196` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-204: Artifact envelope routing preference
- Coverage rows: cov-204
- Fidelity gap refs: cov-204
- Required fidelity items:
- Exact required item: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact required item: Require runtime artifacts summarizing external operations to carry receipt linkage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-204: Artifact envelope routing preference` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-204` repair states the exact requirement: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact acceptance check: The `cov-204` repair states the exact requirement: Require runtime artifacts summarizing external operations to carry receipt linkage
- Exact acceptance check: The `cov-204` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Recommended minimum concern record shape
- Coverage rows: cov-208
- Fidelity gap refs: cov-208
- Required fidelity items:
- Exact required item: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact required item: Keep `blocking_effect` explicitly separate from `severity`
- Acceptance checks represented:
- Exact acceptance check: The heading `### Recommended minimum concern record shape` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-208` repair states the exact requirement: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact acceptance check: The `cov-208` repair states the exact requirement: Keep `blocking_effect` explicitly separate from `severity`
- Exact acceptance check: The `cov-208` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Concern ownership / authority direction
- Coverage rows: cov-211
- Fidelity gap refs: cov-211
- Required fidelity items:
- Exact required item: Define concern owner surfaces across `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`
- Exact required item: Treat `concern resolver` as distinct from owner/source roles
- Exact required item: Allow concern ownership reassignment without changing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Concern ownership / authority direction` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-211` repair states the exact requirement: Define concern owner surfaces across `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`
- Exact acceptance check: The `cov-211` repair states the exact requirement: Treat `concern resolver` as distinct from owner/source roles
- Exact acceptance check: The `cov-211` repair states the exact requirement: Allow concern ownership reassignment without changing concern identity
- Exact acceptance check: The `cov-211` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

## 1. Scope and canonical model

Orchestrator is the core scheduling, concern tracking, blocked-state handling, and runtime-identity management system. It is not the UI, CLI, or external provider.

### Search, routing, and action policy

#### Concern routing and object-first search behavior
- Concern search results route as object-first results with focused-run and target-tab context.
- Concern drill-down preserves the selected `concern_id` and related object context.

#### Concern action policy and authority model
- Concern actions define actor authority, confirmation, rationale, reversibility, and audit fields.
- `acknowledged`, `dismissed`, `resolved`, and structural lineage edits remain distinct actions.

#### Projection trust and action gating
- Orchestrator surfaces use the projection states `current`, `refreshing`, `stale`, `degraded`, and `unavailable`.
- Sensitive actions require `current` data or direct canonical revalidation; degraded mode falls back to record-backed views.

#### Progress-only widget hostability
- Widget-composed Orchestrator content is restricted to `Progress`.
- `orchestrator:progress` persists separately from Dashboard and Usage layouts.

#### Action-surface policy
- Every affordance is classified by navigation vs mutation, palette visibility, shortcut eligibility, multi-target safety, and confirmation/reversibility.
- Bulk actions default to navigation and triage rather than live execution mutation.

#### Progress widget catalog and drill mappings
- Orchestrator consumes the same 13-widget Progress catalog from FinalGUISpec Appendix C:
  1. `progress.run-overview` → Execution unit tree scoped to `focused_run_id`
  2. `progress.current-task` → Node inspector for the active execution unit
  3. `progress.lane-health` → Lane row filtered to the selected lane/worktree
  4. `progress.node-throughput` → Dense node list filtered to slow or blocked nodes
  5. `progress.blocked-concerns` → Concern lane filtered to `blocked` or `attention_required`
  6. `progress.approval-queue` → Concern inspector showing pending approvals
  7. `progress.recovery-status` → Recovery timeline for the selected concern or blocked episode
  8. `progress.artifact-receipts` → Artifact browser filtered to receipt-linked runtime artifacts
  9. `progress.worktree-state` → Source Control worktree row with lane/package/run refs
  10. `progress.account-pressure` → Historical `account_pressure_episode` list
  11. `progress.account-switches` → Historical `account_switch_event` list
  12. `progress.escalation-stack` → Project attention view focused on the shared escalation ladder
  13. `progress.attention-summary` → `project_attention_item.primary_route_payload` list
- Progress labels/taxonomy transfer with the catalog: state labels `queued|running|attention_required|blocked|recovering|degraded|complete`; action labels `Inspect|Focus run|Open evidence|Request approval|Acknowledge|Dismiss|Resolve|Retry recovery`; alert taxonomy `advisory|attention_required|blocked|escalated|degraded_projection`; event taxonomy `run_started|node_started|node_completed|concern_opened|approval_requested|approval_decided|recovery_started|recovery_completed|artifact_published|account_switched`; condition-aging keeps advisory warnings quietable, resurfaces `attention_required`, and never auto-quiets `blocked` or `escalated`.

#### Artifact envelope routing preference
- Cost-bearing artifact routing prefers `usage_event_ref` instead of timestamp heuristics when linking to Usage and Ledger.
- Runtime artifacts that summarize external operations must carry receipt linkage.

### Current vs historical run behavior

#### Focused run and historical routing contract
- Orchestrator uses `active_run_id` / `focused_run_id` together with `focus_mode = live | historical`.
- Cross-tab deep links and search pivots stay coherent on the focused run rather than jumping back to the active run implicitly.

#### Account switch and pressure history
- Orchestrator stores append-only `account_pressure_episode` and `account_switch_event` families.
- Usage, History, Ledger, and Orchestrator all consume the same durable event family.

### Concern and notification model

#### Concern linkage to adjacent families
- Concerns expose `review_refs`, `corroboration_refs`, `graph_patch_refs`, `recovery_refs`, `blocked_episode_refs`, and `promotion_refs`.
- Blocked episodes may reference concerns without replacing concern identity.

#### Notification routing policy
- Notifications route by severity, execution impact, blocked owner, persistence, and projection trust.
- Quiet windows are allowed for advisory warnings, but never for canonical blocked episodes.

#### Dismissed vs resolved rationale enforcement
- Dismissal requires dismissal rationale and resolution requires resolution rationale.
- `accepted_risk` is a resolution path rather than a dismissal.

#### Concern update heuristics
- Repeated sightings use source/scope/category/lineage-aware heuristics to decide whether to update an existing concern or mint a new concern record.

### Project summary, attention, and escalation

#### Shared escalation ladder
- One escalation ladder is shared across Orchestrator, Dashboard, thread badges, and notifications.
- `attention_required` remains distinct from `blocked`, and persistent blockers resurface on meaningful change or persistence.

#### Orchestrator-wide scale contract
- Slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors are mandatory across dense tabs.
- Scale is a cross-tab contract rather than a graph-tab-only concern.

#### Project summary projection
- `project_summary` contains `activity_state`, `attention_state`, `health_state`, `owner`, and projection-trust disclosure.
- Canonical blocked episodes override weaker derived warnings in summary rollups.

#### Project attention projection
- `project_attention_item` carries a primary route payload and projection-trust disclosure.
- The same attention row is consumable across Orchestrator, Dashboard, and notifications.

#### Help architecture and project status taxonomy
- Help uses a dedicated help-entry architecture with related-concept linking.
- Project taxonomy defines `activity_state`, `attention_state`, blocked-owner taxonomy, escalation ladder, and resurfacing/aging rules.

#### Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Blocked-owner kinds are exactly `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`.
- Escalation levels are `info`, `watch`, `attention_required`, `blocked`, and `escalated`, with surface mapping across Orchestrator banners, Dashboard summaries, thread badges, and notifications.

### Source Control boundary

#### Promotion classes and gate evidence
- Promotion classes are `lane_to_package`, `package_to_seam_available`, and `seam_complete`.
- Each promotion class carries exact gate and evidence expectations: promotion gate verdict, lineage refs, required verification evidence, and promotion receipt refs.

#### Source Control and worktree handshake
- Orchestrator remains the lane-pool operational truth, while Source Control is the concrete repo/worktree operator.
- Worktree rows display owning package, lane, and run refs together with lifecycle state and blocked/recovery state.

### glossary/help references

#### Glossary and help governance
- Orchestrator depends on Glossary coverage for rewrite-critical objects, states, and trust terms.
- Help is layered as inline help, context help, and canonical help-entry pages while canonical term names stay stable.

#### Help entry template and related-concept clusters
- Every help entry follows one template: canonical term, trigger conditions, operator meaning, primary routes, related concepts, and recovery guidance.
- Related-concept clusters provide the dedicated linking structure for concept-to-concept navigation.

### Owner-first fidelity recovery order
- Apply owner-doc corrections before consumer and mirror cleanup.
- Rerun fidelity audit only after owner and consumer corrections are in place.

### Shared governance/runtime record envelope
- One shared record envelope carries canonical lineage refs plus artifact and evidence refs.
- Record objects stay distinct from artifacts, receipts, and rendered summaries.

### Concern record family definition
- Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request.
- The owner contract defines `concern_id`, `project_id`, run refs, scope refs, evidence/source refs, lineage refs, severity, category, status, and governance metadata.

### Concern lifecycle and resolution kinds
- Lifecycle states are exactly `active`, `acknowledged`, `resolved`, and `dismissed`.
- `resolution_kind` values are exactly `fixed`, `accepted_risk`, `superseded`, `merged`, `split`, `invalidated`, `obsoleted_by_patch`, and `obsoleted_by_recovery`.

### Concern lifecycle owner section
- This owner section defines explicit semantics for `active`, `acknowledged`, `resolved`, and `dismissed`.
- It carries `resolution_kind`, including `accepted_risk`, together with a concern-action confirmation matrix for acknowledge, dismiss, resolve, and lineage-edit operations.

### Concern owner vs creator vs resolver separation
- `owner_kind` / `owner_ref` are separate from `created_by_kind` / `created_by_ref`.
- Resolver authority is modeled separately from both owner and creator.
- Ownership may change without changing concern identity.

### Concern source-event vs record vs projection split
- `concern_source_event_ref`, `concern_record`, and `concern_projection` are separate structural layers.
- Source events describe raw sightings, records describe durable state, and projections describe rendered consumer views.

### Recommended minimum concern record shape
- Required fields: `concern_id`, `project_id`, `run_ref`, `scope_ref`, `source_event_ref`, `evidence_refs[]`, `artifact_refs[]`, `lineage_refs[]`, `severity`, `category`, `status`, `visibility_level`, `attention_level`, `chatworthy`, `blocking_effect?`.
- `blocking_effect` stays explicitly separate from `severity`.

### Concern ownership / authority direction
- Concern owner surfaces are exactly `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`.
- `concern resolver` is distinct from owner and source roles.
- Concern ownership can be reassigned without changing concern identity.
