# Shard 042: u11 Prism II Usage View-State Addendum - 2026-08-18

Source: `Plans/storage-plan.md`

Source lines: L18127-L18223

Source SHA256: `3184c41cc0823c7cc39c93fd44bebed5bed5d784b4ac43e35979ad7b1e47ab94`

---

## u11 Prism II Usage View-State Addendum - 2026-08-18

This addendum records the Usage page's view-state persistence surface as a storage owner obligation. It
registers no redb family and no EventRecord family here; the machine registry rows remain a separate change.
It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, production
build tasks, final manifests, or PNC-019 receipts.

Final successor evidence is report-owned. When `audit_report.json` records `status = pass_with_named_residuals`
and `verdict = successor_scope_verified_with_named_residuals`, the `evidence_ref` entries below prove only their
named exact-hash PMConcept7 concept/demo slices. They grant no native Slint, production-runtime, PNC-019,
certification, completeness, or product-readiness credit; every blocked, failed, uncaptured, or residual lane
retains that classification.

### SP-248 - Usage View-State Persistence Surface

```yaml
plan_unit_id: SP-248
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The current Usage workspace persists exactly eight current-value-only view/layout families: active `room`,
  disclosure `detail`, date `range`, account/provider `scope`, expanded-room rail `more`, per-room widget
  `hidden` state, per-room settled widget `layout`, and per-room widget `order`. These are configuration/view
  records with no event history and no Settings-owned policy values. The layout family persists only through
  `widget_layout:v1:usage` and the existing typed widget commands after a settled commit; pointer move,
  held-resize preview, configuration preview, ghost, placeholder, animation state, and per-frame drafts never
  write storage. A vanished room, scope, widget, or unsupported geometry migrates or evicts to its documented
  current safe default. The U11 keys `u11:disclosure`, `u11:scope`, `u11:range`, `u11:settingsView`,
  `u11:parked`, `u11:seeded`, `pmw:<pageId>`, and `pm.theme`, together with the PMConcept7 key family
  `pm7:usage:v10:*`, are prototype/import lineage only and are not canonical key names. The
  current `pm7:usage:prototype:workspace:v12` envelope is likewise demo-only, noncanonical prototype lineage;
  when v12 is absent it validates and considers the prior v11 envelope once, and it considers the v10 family
  only through the bounded legacy import when no valid envelope is admitted. None becomes a canonical product
  store or continuing dual-read source.
gui_related: true
gui_classification_reason: These records decide what the Usage page shows on reopen, including disclosure level, scope, range, and widget layout.
depends_on: [SP-222, UF-092, WS-016]
unblocks: [SP-249]
acceptance_criteria:
  - The current Usage view-state surface contains exactly room, detail, range, scope, more, hidden, layout, and order as its eight persisted view/layout families.
  - No Settings-owned policy value or provider-account authority is mirrored into Usage view state.
  - Usage view-state records are current-value-only configuration records and do not inherit the ninety-day provider-attempt retention policy.
  - Layout writes use widget_layout:v1:usage and existing typed widget commands after settled commit; pointer/preview/ghost/placeholder/animation frames cannot write storage.
  - Missing or unsupported room, scope, widget, or geometry references migrate or evict to a named current safe default.
  - U11 and PMConcept7 prototype key names remain import/source-lineage shims and never become canonical key names; the v12 Usage envelope remains demo-only and noncanonical, v11 is considered only as its prior one-time import source, and v10 is bounded rather than maintained as a dual-read path.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shared-runtime-storage-materialize.py check
  - tests/fixtures/usage_gui/presentation/persistence_migration_matrix.json (static contract fixture only)
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/room_disclosure_width_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/range_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/scope_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/migration_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/browser-verification-report.json"
risk_class: usage_view_state_becomes_second_policy_or_preview_store
reasoning_tier: high
context_scope: usage_view_state_persistence
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Widget_System.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: usage_view_state_persistence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T41 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (superseded prototype/import lineage)"
  - Concepts/usage-concepts/QwenUsageConcept/u11-widgets.js
preserved_exact_tokens:
  - room
  - detail
  - range
  - scope
  - more
  - hidden
  - layout
  - order
  - widget_layout:v1:usage
  - RP-CONFIG-CURRENT
negative_constraints:
  - Do not persist a Settings-owned policy value in the Usage view-state surface.
  - Do not attach raw-attempt retention to current-value-only view state.
  - Do not write layout from a pointer move, held preview, ghost, placeholder, animation frame, or configuration preview.
  - Do not promote U11 or PMConcept7 prototype keys to canonical key names.
  - Do not promote v12, v11, or `pm7:usage:v10:*` prototype lineage to canonical storage or maintain a continuing dual-read path.
compatibility_only_notes:
  - "u11:disclosure, u11:scope, u11:range, u11:settingsView, u11:parked, u11:seeded, pmw:<pageId>, pm.theme, pm7:usage:v10:*, pm7:usage:prototype:workspace:v11, and pm7:usage:prototype:workspace:v12 are demo/import/source-lineage shims only; v11-to-v12 consideration is one-time and v10 is a bounded fallback import."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Widget_System.md
  - Plans/usage-feature.md
```
