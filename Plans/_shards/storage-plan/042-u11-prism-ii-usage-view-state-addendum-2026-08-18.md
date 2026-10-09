# Shard 042: u11 Prism II Usage View-State Addendum - 2026-08-18

Source: `Plans/storage-plan.md`

Source lines: L18352-L18458

Source SHA256: `239ad160d0e65de6efd06391e9f8f03af3537708d9149ea4cb7a0bacb7081905`

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
  The current Usage workspace persists exactly nine current-value-only view/layout families: active `room`,
  disclosure `detail`, date `range`, account/provider `scope`, expanded-room rail `more`, per-room widget
  `hidden` state, per-room settled widget `layout`, per-room widget `order`, and the Live / Paused choice `live`
  (2026-10-09, Plans/Decision_Log.md#DL-177, Plans/usage-feature.md#UF-095), a view-only preference that is Live
  by default, decides only whether arriving projection updates are shown at once or held, and is never a Settings
  value. These are configuration/view records with no event history and no Settings-owned policy values. The layout family persists only through
  `widget_layout:v1:usage` and the existing typed widget commands after a settled commit; pointer move,
  held-resize preview, configuration preview, ghost, placeholder, animation state, and per-frame drafts never
  write storage. A vanished room, scope, widget, or unsupported geometry migrates or evicts to its documented
  current safe default. The U11 keys `u11:disclosure`, `u11:scope`, `u11:range`, `u11:settingsView`,
  `u11:parked`, `u11:seeded`, `pmw:<pageId>`, and `pm.theme`, together with the PMConcept7 key family
  `pm7:usage:v10:*`, are prototype/import lineage only and are not canonical key names. The redesigned
  concept's prototype envelope, schema id `pm.usage.widget_layout.v1` stored under the name
  `widget_layout:v1:usage`, and its Live key `pm7:usage:live:v1` are likewise demo-only, noncanonical prototype
  lineage; the envelope's schema id is not a product schema. When that envelope is absent the concept considers
  the prior `pm7:usage:prototype:workspace:v12` envelope once, else the v11 envelope, as a one-time import source,
  and it considers the v10 family only through the bounded legacy import when no valid envelope is admitted.
  None becomes a canonical product store or continuing dual-read source.
gui_related: true
gui_classification_reason: These records decide what the Usage page shows on reopen, including disclosure level, scope, range, and widget layout.
depends_on: [SP-222, UF-092, WS-016]
unblocks: [SP-249]
acceptance_criteria:
  - The current Usage view-state surface contains exactly room, detail, range, scope, more, hidden, layout, order, and live as its nine persisted view/layout families; live is Live by default, view-only, and holds no Settings value.
  - No Settings-owned policy value or provider-account authority is mirrored into Usage view state.
  - Usage view-state records are current-value-only configuration records and do not inherit the ninety-day provider-attempt retention policy.
  - Layout writes use widget_layout:v1:usage and existing typed widget commands after settled commit; pointer/preview/ghost/placeholder/animation frames cannot write storage.
  - Missing or unsupported room, scope, widget, or geometry references migrate or evict to a named current safe default.
  - U11 and PMConcept7 prototype key names remain import/source-lineage shims and never become canonical key names; the redesigned concept's pm.usage.widget_layout.v1 envelope and pm7:usage:live:v1 remain demo-only and noncanonical, v12 (else v11) is considered only as their prior one-time import source, and v10 is bounded rather than maintained as a dual-read path.
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
  - "Concepts/usage-redesign/src/js/40-board.js and src/js/15-film.js (the redesigned concept's layout envelope and remembered Live choice; source-lineage-only)"
  - Plans/Decision_Log.md#DL-177
preserved_exact_tokens:
  - room
  - detail
  - range
  - scope
  - more
  - hidden
  - layout
  - order
  - live
  - widget_layout:v1:usage
  - pm.usage.widget_layout.v1
  - pm7:usage:live:v1
  - RP-CONFIG-CURRENT
negative_constraints:
  - Do not persist a Settings-owned policy value in the Usage view-state surface.
  - Do not attach raw-attempt retention to current-value-only view state.
  - Do not write layout from a pointer move, held preview, ghost, placeholder, animation frame, or configuration preview.
  - Do not promote U11 or PMConcept7 prototype keys to canonical key names.
  - Do not promote v12, v11, or `pm7:usage:v10:*` prototype lineage to canonical storage or maintain a continuing dual-read path.
  - Do not promote `pm.usage.widget_layout.v1` or `pm7:usage:live:v1` to a product schema or key, or store the Live / Paused choice as a Settings value or in a widget layout record.
compatibility_only_notes:
  - "u11:disclosure, u11:scope, u11:range, u11:settingsView, u11:parked, u11:seeded, pmw:<pageId>, pm.theme, pm7:usage:v10:*, pm7:usage:prototype:workspace:v11, pm7:usage:prototype:workspace:v12, the redesigned concept's pm.usage.widget_layout.v1 envelope and pm7:usage:live:v1 are demo/import/source-lineage shims only; the v12 (else v11) import into the redesigned envelope is one-time and v10 is a bounded fallback import."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Widget_System.md
  - Plans/usage-feature.md
```
