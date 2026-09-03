# Shard 033: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L2218-L2450

Source SHA256: `7b67c3b77b9b01ff15f7d0ef2e1561c9a3c00add9b610c9d4128d52a4c920b7b`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum closes the Runtime Artifacts spec gaps exposed by the winning Cozy Shelves left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, source-lineage-only; no concept HTML, CSS, or class names are canon). It binds the panel's label-only actions to canonical `cmd.*` ids, pins the freshness x health visual mapping, adds positive empty states, records how artifact receipt rows consume the shared unified expander contract, and surfaces retention/pin/tombstone behavior. Ratified inputs are cited as user decision 2026-07-27: the rail width envelope (240px min / 480px max / 280px default; 220px is test-only adversarial), the `--cat-*` per-theme category indirection with `--accent-primary` reserved for selection, and the c2 concept files as the patched-in-place implementation base. The unified expander contract itself is owned by the GUI shell owner doc (`Plans/FinalGUISpec.md`, Cozy Shelves reconciliation layer); this panel consumes it and does not re-own it. `Plans/UI_Command_Catalog.md` retains sole `cmd.*` minting authority. Slint compatibility holds throughout: opaque precomputed surfaces, precomputed color math, no arbitrary-content backdrop blur, no SVG filters, and glass only as pre-blurred wallpaper. This addendum creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks, and it never edits or supersedes existing PlanUnits except by explicit new-unit statement.

### RAP-048 - Cozy Shelves Action-To-Command Binding

```yaml
plan_unit_id: RAP-048
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Every mandated Runtime Artifacts panel action binds to a canonical UI_Command_Catalog id; label-only
  actions are retired as canon. Show in Ledger = cmd.artifacts.show_in_ledger and Show in Usage =
  cmd.artifacts.show_in_usage (existing rows); list sort = cmd.artifacts.sort (shell_view row); recording
  playback = cmd.artifacts.play_recording (record-only availability); live recording watch =
  cmd.artifacts.watch_recording (live-run availability); Sources = cmd.artifacts.show_sources
  (navigation wrapper replacing the prototype web.sources verb); panel entry = cmd.panel.switch with
  panel_id = artifacts (retiring prototype panels.show/panels.open_chat forms). Open and Watch on
  visible-session evidence dispatch the ATS-owned Open/Watch fallback route (ATS-009 semantics preserved
  by RAP-030) rather than artifact-local commands, and inspect / rerun-with-a-question on described-image
  and receipt rows route to the owning surface; the panel never executes reruns or mutations locally.
  This unit binds labels to ids only; Plans/UI_Command_Catalog.md mints and owns the rows.
gui_related: true
gui_classification_reason: Action bindings determine which visible panel controls dispatch which commands.
depends_on: [RAP-008, RAP-030, RAP-042, RAP-044, UCC-109]
unblocks: []
acceptance_criteria:
  - Each mandated panel action has exactly one canonical cmd.* binding and no label-only action remains unbound.
  - Prototype verbs web.sources, panels.show, and panels.open_chat do not survive as canonical ids.
  - play_recording is available on completed recordings only and watch_recording on live runs only, with reason-coded disabled states otherwise.
  - Open/Watch on visible-session evidence resolves through the ATS-owned route, and inspect/rerun actions resolve to owner surfaces, never panel-local execution.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Cozy Shelves control-reconciliation artifact check
risk_class: artifact_action_command_drift
reasoning_tier: standard
context_scope: cozy_shelves_artifact_command_binding
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: artifact_action_command_binding
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/UI_Command_Catalog.md Cozy Shelves reconciliation layer"
preserved_exact_tokens:
  - cmd.artifacts.show_in_ledger
  - cmd.artifacts.show_in_usage
  - cmd.artifacts.sort
  - cmd.artifacts.play_recording
  - cmd.artifacts.watch_recording
  - cmd.artifacts.show_sources
  - cmd.panel.switch
negative_constraints:
  - Do not keep label-only actions as canonical panel canon.
  - Do not mint cmd.* rows in this doc; UI_Command_Catalog.md owns minting.
  - Do not execute rerun, inspect-mutation, or recording capture panel-locally.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
```

### RAP-049 - Freshness x Health Visual Mapping

```yaml
plan_unit_id: RAP-049
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  The projection_freshness x projection_health matrix (current | refreshing | stale x healthy | degraded |
  unavailable) renders through two redundant channels: projection_health drives the row/panel status dot
  color from theme status tokens, and projection_freshness renders as a text staleness chip (current shows
  no chip; refreshing and stale show labeled chips). All nine combinations remain distinguishable, state is
  never encoded by color alone, and degraded or unavailable health always carries its text label plus the
  recovery/disclosure provenance link required by the Case L consumer contract. The health dot never uses
  --accent-primary, which stays reserved for selection (user decision 2026-07-27); category shelf tinting
  is a separate --cat-* per-theme indirection concern and does not encode health or freshness.
gui_related: true
gui_classification_reason: Defines the visible badge/chip treatment for artifact projection trust states.
depends_on: [RAP-045]
unblocks: []
acceptance_criteria:
  - Fixtures render all nine freshness x health combinations distinguishably with dot color plus text chip, never color alone.
  - A current-but-degraded projection shows a healthy-position freshness (no chip) with a degraded dot and its text label, never a healthy rendering.
  - Stale and refreshing chips are text-labeled and readable in every shipped theme, including retro-dark and basic-light overrides.
  - Degraded and unavailable states link the owning recovery/disclosure record.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L Runtime Artifacts continuity and EventRecord fixture suite
risk_class: freshness_health_color_only_signal
reasoning_tier: standard
context_scope: artifact_freshness_health_rendering
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_freshness_health_visual_mapping
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:2037-2042"
preserved_exact_tokens:
  - projection_freshness
  - projection_health
compatibility_only_notes:
  - "Slint compatibility: freshness/health treatments are opaque precomputed surfaces with precomputed color math; no arbitrary-content backdrop blur and no SVG filters at runtime; glass appears only as pre-blurred wallpaper."
negative_constraints:
  - Do not encode any freshness or health state by color alone.
  - Do not collapse the two axes into one badge or reuse --accent-primary for health.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```

### RAP-050 - Positive Empty States

```yaml
plan_unit_id: RAP-050
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  A healthy-but-empty Runtime Artifacts panel renders a positive empty state, never a bare blank list.
  With a proven-coherent snapshot and no runs yet for the project, the panel shows a no-runs-yet state
  with a short explanation and a CTA that routes to the owning run surface; the panel itself never
  dispatches work. When active filters reduce a non-empty index to zero rows, the panel shows a
  filtered-to-zero state naming the active filter summary with a clear-filter chip that restores the
  unfiltered list. These positive states apply only when the storage owner proves a coherent healthy
  snapshot; root_mismatch, root_unavailable, fallback_diverged, viewer/blocked, and
  unprovable-snapshot conditions keep the RAP-047 owner posture and never render as an apparently
  empty artifact list.
gui_related: true
gui_classification_reason: Empty, filtered-empty, and blocked-empty renderings are user-visible panel states.
depends_on: [RAP-026, RAP-047]
unblocks: []
acceptance_criteria:
  - No-runs-yet fixtures show explanation plus a CTA routing to the owning run surface without panel-local dispatch.
  - Filtered-to-zero fixtures show the active filter summary and a clear-filter chip that restores the list.
  - Root-mismatch, root-unavailable, fallback-diverged, and viewer/blocked fixtures never render either positive empty state.
  - The two positive empty states are visually and textually distinct from each other and from blocked/diagnostic states.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Runtime Artifacts empty-state fixtures
risk_class: empty_state_ambiguity
reasoning_tier: standard
context_scope: artifact_panel_empty_states
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_panel_positive_empty_states
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:2056"
negative_constraints:
  - Do not render storage-access or continuity failures as an empty artifact list.
  - Do not let the empty-state CTA execute runs from the panel.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```

### RAP-051 - Receipt-Row Unified Expander Consumption

```yaml
plan_unit_id: RAP-051
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts rows consume the shared unified expander contract owned by the GUI shell owner doc
  without re-owning it: rows are collapsed by default, the row header is a single accessible button with
  aria-expanded, and the body follows the slot order kv-facts, status-detail, blocked-reason-detail,
  actions, overflow with an approximately 200px body cap and internal scroll. The collapsed receipt row is
  two lines carrying the artifact family pill, label, status, and age; failed rows keep a one-line failure
  excerpt and live rows keep their progress line while collapsed. Blocked reasons stay visible outside the
  collapsible body, destructive actions route through the shared confirm surface, and blocked payloads
  carry blocked_reason_code plus ordered allowed_action_ids[]. The expanded body exposes the
  metadata-first demand-loaded preview, provenance/producer refs, the actions row including the retention
  line and pin action, a copyable canonical artifact id, and truncation_state for any excerpted content.
  Investigation-bundle groups collapse with same-kind grouping and per-kind count badges, remaining the
  RAP-013 index/navigation layer over canonical artifact records rather than a new family.
gui_related: true
gui_classification_reason: Row anatomy, expansion behavior, and grouped-bundle presentation are visible panel structure.
depends_on: [RAP-008, RAP-013, RAP-041, RAP-042]
unblocks: []
acceptance_criteria:
  - Rows default collapsed with a single aria-expanded header button and the mandated body slot order.
  - Collapsed rows keep family pill, label, status, and age; failed rows keep their one-line excerpt and live rows their progress line.
  - Blocked reasons render outside the collapsible body and blocked payloads preserve blocked_reason_code plus ordered allowed_action_ids[].
  - Expanded bodies expose demand-loaded preview, provenance refs, retention line, pin action, copyable id, and truncation_state within the ~200px internal-scroll cap.
  - Investigation groups collapse with same-kind grouping and count badges without minting a new artifact family.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future unified expander conformance fixtures
risk_class: expander_contract_fork
reasoning_tier: standard
context_scope: artifact_receipt_row_expander
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_receipt_row_expander_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:193-260"
preserved_exact_tokens:
  - blocked_reason_code
  - "allowed_action_ids[]"
  - truncation_state
compatibility_only_notes:
  - "Slint compatibility: expander bodies are opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters; motion and color math precomputed."
negative_constraints:
  - Do not re-own or fork the unified expander contract in this doc.
  - Do not hide blocked reasons inside the collapsible body.
  - Do not route destructive actions outside the shared confirm surface.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
```
