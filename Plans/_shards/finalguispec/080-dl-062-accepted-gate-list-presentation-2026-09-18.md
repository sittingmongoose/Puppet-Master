# Shard 080: DL-062 — Accepted Gate List Presentation (2026-09-18)

Source: `Plans/FinalGUISpec.md`

Source lines: L38202-L38244

Source SHA256: `67f37b6d89db7c1aba45288acbc4f9df3bb02753aca6b03c453b2dbe81fb6a4a`

---

## DL-062 — Accepted Gate List Presentation (2026-09-18)

This addendum compiles accepted planning decisions only. Live semantic owners retain command admission, native behavior, authorization and evidence authority. Existing command schemas and production wiring remain unchanged.

### F3-561 — Gate List Source And Enforcement Columns

```yaml
plan_unit_id: F3-561
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The current checks region presents one gate list. Each row carries a source column naming the provider surface
  the row came from and an enforcement column reading required, advisory, not enforced or unknown, in those
  ordinary words rather than underscore enums. No second policies region is added. A row whose enforcement the
  provider does not publish reads unknown. Where a provider groups its gates, as Azure does under ADO-007, the
  grouping is a composition of this one list and the groups are labelled; an informational group is visibly not a
  gate. A truncated list is shown as truncated with the control that resumes it, never as a complete one.
gui_related: true
gui_classification_reason: Defines visible columns, words, grouping and truncation presentation in the region a person reads to find what blocks a merge.
depends_on: [F3-529, SCS-005, SCS-023]
unblocks: []
acceptance_criteria:
  - Every gate row shows a source and an enforcement value in ordinary words, with no underscore enum or raw provider identifier in ordinary presentation.
  - An enforcement value the provider does not publish reads unknown rather than required or advisory.
  - A provider grouping is a labelled composition of the one list, and an informational group is visibly not a gate.
  - A truncated gate list is shown as truncated with the control that resumes it.
  - No command, handler, event or runtime behaviour is admitted by this unit, and no WorkNode or NodeSeed is created.
validation_surfaces:
  - >-
    no validator surface in this landing; recorded as `q-020`. The shapes this unit describes are not in any schema or fixture pack, because the addendum admits no typed schema variant, so the unit is stated and not yet falsifiable. Neither final-GUI contract file is touched by this landing and neither carries a gate
    list, a source column or an enforcement value, so neither can test this unit.
  - future gate-list responsive and accessibility fixtures
risk_class: unstated_enforcement_or_duplicated_gate_presentation
reasoning_tier: high
context_scope: gate_list_presentation
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/Source_Control_System.md, future Source Control Slint components]
node_compile_hint: {mode: static_gui_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-062, Plans/Source_Control_System.md#SCS-023, Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-004]
preserved_exact_tokens: [current checks, gate list, source, enforcement, required, advisory, not enforced, unknown, informational]
negative_constraints: [Do not add a second policies region., Do not show an underscore enum or a raw provider identifier as an enforcement value., Do not present an informational group as a gate., Do not present a truncated gate list as complete.]
owner_hints: [Plans/FinalGUISpec.md, Plans/Source_Control_System.md]
```
