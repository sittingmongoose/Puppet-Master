# Shard 031: PMConcept7 Concept Promotion Addendum - 2026-07-23

Source: `Plans/usage-feature.md`

Source lines: L6173-L6237

Source SHA256: `c50527a3f019e145fb3d6329af96044e8af04a2ff3b90ec28806717228eae686`

---

## PMConcept7 Concept Promotion Addendum - 2026-07-23

This addendum promotes user-approved PMConcept7 (ChatGuiUpdates2 workstreams, revs 4-9.2) Usage page head behaviors into canonical PlanUnits. `Concepts/PMConcept7.html` and `Concepts/ChatGuiUpdates2.md` remain illustrative source-lineage only. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### UF-089 - Usage Page Head Presentation

```yaml
plan_unit_id: UF-089
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  The Usage page head stays one line. Its subtitle follows the copy pattern "AI Cost/usage for
  <project> — quotas, cost, cache savings and safety guards. Refreshes every 5 minutes; history kept
  for 90 days." where <project> is the active project name; the concept fixture shows project
  Tastebook. The 5-minute figure mirrors the default auto-refresh cadence inside the documented 5-15
  minute background refresh window and the 90-day figure mirrors the default raw-event retention
  window; changed defaults surface the configured values rather than stale copy. Refresh and Export
  render as icon-only buttons (inline SVG restart and clipboard glyphs), each carrying `title` and
  `aria-label` accessible names, and dispatch cmd.usage.refresh and cmd.usage.export unchanged.
gui_related: true
gui_classification_reason: This unit defines the visible Usage page head copy, subtitle pattern, and icon-only Refresh/Export presentation.
split_recommended: false
depends_on: [UF-006, UF-039]
unblocks: []
acceptance_criteria:
- "The Usage page head renders one line with the subtitle pattern 'AI Cost/usage for <project> — quotas, cost, cache savings and safety guards. Refreshes every 5 minutes; history kept for 90 days.' resolved against the active project name (concept fixture: Tastebook)."
- "The subtitle's 5-minute figure reflects the default auto-refresh cadence and the 90-day figure reflects the default raw-event retention window; changed defaults surface the configured values rather than stale copy."
- "Refresh and Export render as icon-only buttons with inline SVG restart and clipboard glyphs, each carrying title and aria-label accessible names, and dispatch cmd.usage.refresh and cmd.usage.export with unchanged behavior."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_page_head_presentation
implementation_surfaces:
- "Plans/usage-feature.md"
node_compile_hint:
  mode: usage_page_head_presentation
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
- "Plans/usage-feature.md (background refresh 5-15 minute default window; 90-day raw-event retention default)"
preserved_exact_tokens:
- "AI Cost/usage for"
- "Refreshes every 5 minutes; history kept for 90 days."
- "Tastebook"
- "icon-only"
- "aria-label"
negative_constraints:
- "Do not add a second head line or re-introduce text-labeled Refresh/Export buttons on the Usage page head."
- "Do not hardcode Tastebook or the 5-minute/90-day figures as literal copy; the project name is the active project and the figures mirror the configured defaults."
- "Do not change cmd.usage.refresh or cmd.usage.export IDs, payloads, events, or preconditions from this unit; it is presentation only."
compatibility_only_notes:
- "Slint portability: the Usage page head and its icon-only controls render as opaque precomputed surfaces with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The 'prominent Refresh action' presentation is retired per PMConcept7 rev 9 Usage head; Refresh remains an explicit user action rendered icon-only with title and aria-label accessible names so the head stays one line."
owner_boundary_notes:
- "Page-header layout and per-theme header boxes are owned by Plans/FinalGUISpec.md F3-462; this unit owns Usage head copy and control presentation only."
- "cmd.usage.refresh and cmd.usage.export command semantics are owned by Plans/UI_Command_Catalog.md (UCC-116); this unit registers no commands."
owner_hints:
- "Plans/usage-feature.md"
```
