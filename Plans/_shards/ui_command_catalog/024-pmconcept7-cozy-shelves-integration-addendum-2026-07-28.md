# Shard 024: PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

Source: `Plans/UI_Command_Catalog.md`

Source lines: L10845-L10908

Source SHA256: `f93f6e4068b3fbc187156116ccdcce168571267d7048d1a50ba2ce87d7de25a2`

---

## PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

This addendum adjudicates the one command-id hole found by the PMConcept7 integration closure re-check (`cmd.chat.open`) and records the resulting alias. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### PM7 integration command reconciliation

| Token | Disposition | Canonical target and notes |
|---|---|---|
| `cmd.chat.open` | alias-of `cmd.chat.open_thread` | found by the 2026-07-28 PM7 integration closure re-check (present in the concept census without an adjudication row); chat-open affordances route the canonical thread-open command; exclusions-registered, never a second primary wiring row |

### UCC-143 - Chat Open Alias Adjudication

```yaml
plan_unit_id: UCC-143
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.chat.open is adjudicated as a compatibility alias of cmd.chat.open_thread:
  every chat-open affordance in the integrated panels routes the canonical
  thread-open command, the alias is exclusions-registered so it never becomes a
  second primary wiring row. The historical PMConcept7 integrated-panels census
  recorded all 135 unique command tokens as canonical or recorded alias at
  census time. That census is not currentness evidence after the PM6/PM7
  rebaseline; a fresh census is required before any current 100%
  integrated-panel claim.
gui_related: true
gui_classification_reason: Chat-open controls are user-visible affordances in the rail panels.
split_recommended: false
depends_on: [UCC-142]
unblocks: []
acceptance_criteria:
- "cmd.chat.open resolves as a recorded alias of cmd.chat.open_thread in this catalog and the exclusions registry."
- "No production wiring row registers cmd.chat.open as a primary command."
- "The preserved PM7 census is explicitly historical/deferred; a fresh census must report zero unresolved tokens before it can serve as currentness evidence."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-index.py validate"
- "python3 scripts/pm-plans-verify.py validate-wiring-matrix"
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces:
- "Plans/UI_Command_Catalog.md"
- "Plans/Wiring_Matrix.production.exclusions.json"
node_compile_hint:
  mode: chat_open_alias_adjudication
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
- "Plans/CozyShelves_PM7_Control_Reconciliation.json (historical PM7 census; currentness deferred pending true re-census)"
preserved_exact_tokens:
- "cmd.chat.open"
- "cmd.chat.open_thread"
negative_constraints:
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
- "Do not register cmd.chat.open as a canonical production command; it is alias-only."
stale_retired_dispositions: []
owner_boundary_notes:
- "cmd.chat.open_thread's canonical row semantics are owned by the existing chat command sections; this unit owns only the alias adjudication."
owner_hints:
- Plans/UI_Command_Catalog.md
```
