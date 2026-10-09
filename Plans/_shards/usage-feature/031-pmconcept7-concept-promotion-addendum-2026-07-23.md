# Shard 031: PMConcept7 Concept Promotion Addendum - 2026-07-23

Source: `Plans/usage-feature.md`

Source lines: L6182-L6256

Source SHA256: `297218ce696180a7306329bc27edfe82e7ad73f32b68c08f288da6638bb15cdb`

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
  The Usage page head stays one line. Since the redesigned page replaced the old one (DL-163), the head is the
  room's head: the room title with one short description line under it, and on the same line the scope, range and
  disclosure menus, the room's panel menu, and the Refresh and Export buttons. The page name "Usage" sits in the
  rail head, and the Live / Paused control (UF-107) sits beside it there, never as a second head line. Wherever
  the head or a room states the refresh cadence or the history kept, the figures mirror the configured background
  refresh cadence and raw-event retention window rather than fixed copy. Refresh and Export render as icon-only
  buttons (inline SVG glyphs), each carrying `title` and `aria-label` accessible names. Refresh dispatches
  cmd.usage.refresh unchanged. Export opens a menu in the chat menu style (DR-058) with two rows, Snapshot and
  Ledger, and each row dispatches cmd.usage.export with scope snapshot or ledger; the menu adds no command and
  no export scope.
gui_related: true
gui_classification_reason: This unit defines the visible Usage page head, where its Live control sits, and the icon-only Refresh and Export presentation.
split_recommended: false
depends_on: [UF-006, UF-039]
unblocks: []
acceptance_criteria:
- "The Usage head renders one line: the room title with one description line under it, and the scope, range, disclosure, panel, Refresh and Export controls on that line; no second head line exists."
- "The Live / Paused control sits in the rail head beside the page name Usage, not in the room head and not on a second head line."
- "Any refresh-cadence or history-retention figure the page shows reflects the configured value; changed defaults surface the configured values rather than stale copy."
- "Refresh and Export render as icon-only buttons with inline SVG glyphs, each carrying title and aria-label accessible names; Refresh dispatches cmd.usage.refresh, and Export's Snapshot and Ledger rows each dispatch cmd.usage.export with scope snapshot or ledger."
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
- "Concepts/usage-redesign/src/markup.html and src/js/46-shell.js (the redesigned Usage head and Export menu; source-lineage-only)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/DECISIONS-20261009.md (SHA-256 fd8d2d8a092e97f2964331dfe3befea99f2aa66691b5021313bae2cad0a25008)"
- "Plans/usage-feature.md (background refresh 5-15 minute default window; 90-day raw-event retention default)"
preserved_exact_tokens:
- "AI Cost/usage for"
- "Refreshes every 5 minutes; history kept for 90 days."
- "Tastebook"
- "icon-only"
- "aria-label"
- "Live / Paused"
- "Snapshot"
- "Ledger"
negative_constraints:
- "Do not add a second head line or re-introduce text-labeled Refresh/Export buttons on the Usage page head."
- "Do not hardcode a project name or the refresh-cadence and retention figures as literal copy; they mirror the active project and the configured values."
- "Do not change cmd.usage.refresh or cmd.usage.export IDs, payloads, events, or preconditions from this unit, and do not mint a command or an export scope per Export menu row; it is presentation only."
compatibility_only_notes:
- "Slint portability: the Usage page head and its icon-only controls render as opaque precomputed surfaces with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed. This note does not bind the redesigned concept's look (DL-163): the Slint limits were lifted for the concept, and framework version pins are untouched."
stale_retired_dispositions:
- "The 'prominent Refresh action' presentation is retired per PMConcept7 rev 9 Usage head; Refresh remains an explicit user action rendered icon-only with title and aria-label accessible names so the head stays one line."
- "The page-level subtitle 'AI Cost/usage for <project> — quotas, cost, cache savings and safety guards. Refreshes every 5 minutes; history kept for 90 days.' (concept fixture project Tastebook) is retired by DL-163: the room description line replaces it, and the rule that cadence and retention figures mirror configured values is kept."
- "The single-action Export button is retired: Export is an icon-only button that opens the Snapshot and Ledger menu, dispatching the same cmd.usage.export scopes."
owner_boundary_notes:
- "Page-header layout and per-theme header boxes are owned by Plans/FinalGUISpec.md F3-462; the redesigned head's look is owned by Plans/FinalGUISpec.md F3-623; this unit owns Usage head copy and control presentation only."
- "cmd.usage.refresh and cmd.usage.export command semantics are owned by Plans/UI_Command_Catalog.md (UCC-116); this unit registers no commands."
owner_hints:
- "Plans/usage-feature.md"
```
