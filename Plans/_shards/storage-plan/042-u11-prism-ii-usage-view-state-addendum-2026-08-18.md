# Shard 042: u11 Prism II Usage View-State Addendum - 2026-08-18

Source: `Plans/storage-plan.md`

Source lines: L18127-L18204

Source SHA256: `d18a405bd34411252183166a84ff12b48b6d9c9953cb37319a0503d39f60d506`

---

## u11 Prism II Usage View-State Addendum - 2026-08-18

This addendum records the Usage page's view-state persistence surface as a storage owner obligation. It
registers no redb family and no EventRecord family here; the machine registry rows remain a separate change.
It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, production
build tasks, final manifests, or PNC-019 receipts.

### SP-248 - Usage View-State Persistence Surface

```yaml
plan_unit_id: SP-248
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The Usage page persists exactly eight keys and every one of them is view or layout state: the disclosure
  level, the page scope selection, the page date range, the per-product continuation view selection, the
  parked-widget record, the seeded-room record, the per-page widget layout record, and the shared theme
  selection. None of them is a Settings-owned policy value, and the Usage page must not re-acquire one by
  mirroring it: policy is read from its Settings owner as a projection and changed only by deep-linking to
  that owner. Each of the eight is current-value-only under a configuration retention disposition with no
  history, which is a different retention story from the raw provider attempt and operational records that
  carry the ninety-day figure in UF-089; conflating the two attaches the wrong retention to the wrong
  family. A view-state value whose referent has vanished evicts to its documented safe default rather than
  pinning a dangling identity, and the widget layout record persists only through the canonical widget
  layout namespace and its typed layout commands, never as a direct write on pointer move, resize preview,
  or configuration edit. The concept's colon-form keys are prototype shims like the PMConcept7 precedent,
  not canonical key names.
gui_related: true
gui_classification_reason: These records decide what the Usage page shows on reopen, including disclosure level, scope, range, and widget layout.
depends_on: [SP-222, UF-092, WS-016]
unblocks: []
acceptance_criteria:
  - The Usage view-state surface holds exactly the eight enumerated view or layout records and no Settings-owned policy value.
  - Usage view-state records are current-value-only with a configuration retention disposition and carry no history; the ninety-day figure belongs to provider attempt and operational records, not to these keys.
  - A persisted scope, range, or widget-layout reference whose target no longer exists evicts to its documented safe default and discloses the fallback rather than rendering a dangling identity.
  - Widget layout writes go through the canonical widget layout namespace and its typed commands; a direct storage write from a pointer-move, resize-preview, or configuration edit fails the fixture.
  - The concept's colon-form keys are recorded as prototype shims and are never promoted to canonical key names.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shared-runtime-storage-materialize.py check
  - future Usage view-state eviction and layout-write fixtures
risk_class: usage_view_state_becomes_second_policy_store
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
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/QwenUsageConcept/u11-widgets.js
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
preserved_exact_tokens:
  - "u11:disclosure"
  - "u11:scope"
  - "u11:range"
  - "u11:settingsView"
  - "u11:parked"
  - "u11:seeded"
  - "pmw:<pageId>"
  - "pm.theme"
  - RP-CONFIG-CURRENT
negative_constraints:
  - Do not persist a Settings-owned policy value in the Usage view-state surface.
  - Do not attach the raw-attempt retention figure to current-value-only view state.
  - Do not write widget layout directly from a pointer, preview, or configuration interaction.
  - Do not promote a prototype colon-form key to a canonical key name.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Widget_System.md
  - Plans/usage-feature.md
```
