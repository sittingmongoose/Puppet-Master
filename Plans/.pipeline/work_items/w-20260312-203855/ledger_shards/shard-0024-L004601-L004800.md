  - focus global Orchestrator search
  - next/previous tab
  - open/close right-side inspector
  - jump between current attention items
  - fit graph / focus selected node / toggle generation overlay
- Higher-risk runtime actions should not default to global shortcuts unless they already pass the stronger action-policy rules.

### Context-menu direction
- Context menus are the right home for object-specific operational actions.
- Recommended rule:
  - object context menus should show only actions valid for that object's current state, with canonical labels from runtime semantics
- This fits especially well for:
  - node
  - concern
  - promotion
  - graph patch
  - lane/worktree
  - recovery record

### Routing contract implication
- This seam reinforces the earlier search/deep-link work:
  - command palette results, keyboard shortcuts, context menus, and widgets should route through the same destination payload model
- Good shared payload fields:
  - `project_id`
  - `focused_run_id`
  - destination tab/surface
  - selected object id and type
  - optional inspector target
  - optional filter payload
- Without that, palette actions and deep links will drift into multiple incompatible navigation systems.

### Confirmation / safety implication
- This seam connects directly to the earlier confirmation-policy work.
- Recommended rule:
  - command discoverability does not weaken confirmation requirements
- If an action is:
  - `strong` confirmation
  - `hard_gate`
  - `non_reversible`
  - or only `compensating_action_only`
  then command palette and shortcut surfaces must still honor the same gating and preview requirements.

### Source Control / worktree implication
- Because Source Control is worktree-first and physically narrow, it should lean more on context menus and focused commands than on dense inline action bars.
- Bulk worktree cleanup/archive/remove should remain preview-heavy and explicit.
- Orchestrator can expose deep links into those actions, but should not become the main place where raw Git/worktree batch cleanup is fired blindly.

### Contradictions / gaps surfaced
- The command infrastructure is ahead of the Orchestrator-specific safety policy.
- Current docs do not yet define which Orchestrator actions are:
  - palette-visible
  - shortcut-worthy
  - context-menu only
  - bulk-safe
  - bulk-forbidden
- Current grouped/bulk navigation wording could be misread as license for broad bulk execution controls unless rewrite docs tighten it.

### Candidate fixes to carry forward
- Add an Orchestrator action-surface policy that classifies actions by:
  - navigation vs mutation
  - single-target vs multi-target
  - shortcut eligibility
  - palette visibility
  - confirmation/reversibility class
- Default bulk actions to triage and navigation, not live execution mutation.
- Reuse one shared routing payload across command palette, shortcuts, widgets, search, and deep links.
- Keep canonical runtime command ids authoritative for blocked/recovery actions on every surface.

### Do-not-forget details
- palette visibility must not silently downgrade confirmation strength
- bulk actions should be far narrower than bulk navigation
- context menus are likely the cleanest home for exact object-valid live actions

## Research Progress - 2026-03-16 - Projection Health / Stale-Data Trust Execution Policy

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/usage-feature.md`
- `Plans/Contracts_V0.md`

### Key findings
- The storage/runtime side already clearly establishes the architectural baseline:
  - `seglog` is canonical
  - `redb`, Tantivy, JSONL mirrors, rollups, and UI-facing keys are projections or derived state
  - projections must be rebuildable from canonical records
- Some docs already hint at trust/freshness issues:
  - Usage explicitly worries about stale data and requires `Last updated` + refresh behavior
  - blocked/recovery surfaces already rely on current runtime projections and valid `allowed_action_ids[]`
  - `History` and `Ledger` are closer to canonical records than widget rollups or live dashboards
- What is still missing is a shared Orchestrator-wide execution policy for:
  - projection freshness
  - degraded projection behavior
  - when actions must be gated
  - when the UI should fall back to record-backed views

### Recommended trust model
- Strong recommendation:
  - keep the earlier projection states and make them operational:
    - `current`
    - `refreshing`
    - `stale`
    - `degraded`
    - `unavailable`
- Working meaning:
  - `current`
    - projection is up to date enough for normal read + write interaction
  - `refreshing`
    - slightly behind but actively catching up; read is fine, write may still be fine depending on object class
  - `stale`
    - data is old enough that mutation-bearing actions should narrow or require refetch
  - `degraded`
    - projector or dependency failure means the surface may be incomplete or partially wrong
  - `unavailable`
    - projection cannot currently support that surface; UI must fall back or disable

### Action-gating direction
- Important rule:
  - not all surfaces need the same trust threshold
- Recommended gating split:
  - low-risk read-only inspection
    - allowed on `refreshing`, often allowed on `stale`, sometimes allowed on `degraded`
  - precise navigation / deep-linking
    - usually allowed if the target object identity is still valid
  - live mutation / approval / recovery / retry / cleanup
    - require `current` or a direct canonical-runtime validation path
- If a surface is `stale` or `degraded`, the GUI must not present mutation controls that imply hidden confidence.

### Surface-specific direction
- `Progress`
  - most vulnerable to stale/degraded projection confusion because it is summary-heavy
  - should show visible freshness state and route users to native tabs for exact inspection when trust drops
- `Seams`
  - rollups can remain browsable when slightly stale, but completion/promote/governance actions should tighten quickly
- `Node Graph`
  - focused inspection may survive mild staleness
  - live status claims, blocked action buttons, and generation overlays should disclose trust state explicitly
- `Evidence`
  - evidence/artifact browsing can often survive stale projections because records/artifacts are durable
  - new-links/live-status indicators may not
- `History`
  - should remain broadly usable under degraded projections because chronological record slices can fall back closer to canonical events
- `Ledger`
  - strongest fallback surface for exact inspection
  - exact ledger browsing should remain available via slice-based record queries even when higher-level projections are unhealthy

### Canonical-validation direction
- Recommended rule:
  - if a write action is attempted from a stale/degraded surface, the runtime should either:
    - refuse with a clear reason
    - or perform an authoritative revalidation against canonical/current runtime state before executing
- The GUI should never guess that a previously visible `allowed_action_ids[]` set is still valid if the blocked projection is stale.

### UX disclosure direction
- The trust model needs visible UI grammar, not just backend states.
- Good shared fields:
  - `freshness_state`
  - `last_updated_at`
  - `data_source_kind`
  - `degraded_reason?`
  - `action_gate_reason?`
- Good copy style:
  - `View may be stale`
  - `Projection degraded`
  - `Live actions unavailable until refresh`
  - `Showing canonical history slice`

### Fallback direction
- Strong recommendation:
  - when trust drops, degrade toward exact record-backed inspection, not toward empty ambiguity
- Example fallback ladder:
  - widget summary -> native tab
  - rollup tab -> filtered record list
  - projection-derived inspector -> `Ledger` / `History` / exact record view via `detail_ref`

### Contradictions / gaps surfaced
- Current docs establish canonical vs derived storage, but not the UI policy that follows from that distinction.
- There is no shared freshness/trust contract yet for Orchestrator tabs.
- Some current wording still risks implying that if data is visible, it is safe to act on it, which is not defensible once projections can lag or degrade.

### Candidate fixes to carry forward
- Define one shared projection-trust contract with operational state meanings and action thresholds.
- Require all dense Orchestrator tabs to show freshness/last-updated/disclosure state.
- Gate mutation controls on trusted projections or explicit runtime revalidation.
- Standardize fallback toward record-backed views (`History`, `Ledger`, exact record inspectors) when projections are degraded.

### Do-not-forget details
- stale visibility is not the same as action authority
- blocked/recovery controls are especially sensitive because `allowed_action_ids[]` can go invalid if projection trust drops
- `Ledger` and record inspectors should be the stable fallback when summary surfaces lose trust

## Research Progress - 2026-03-16 - Shared Record Envelope / Artifact Normalization

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/FinalGUISpec.md`
