# Shard 018: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L1725-L1759

Source SHA256: `68378275f233e682c37ebbeb405a91ea064046815bf2454781f7589caba3304b`

---

## Ledger Compile Addendum - pldg-20260614-001

### BS-025 - Deterministic Discovery Algorithm Heading Recovery

```yaml
plan_unit_id: BS-025
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocator_Spec contains duplicate Deterministic discovery algorithm headings. Recovery is anchor cleanup only: preserve the live
  deterministic discovery algorithm behavior and make duplicate heading text an alias or compatibility/source-lineage pointer.
gui_related: false
gui_classification_reason: Binary discovery algorithm heading repair is backend documentation structure, not GUI presentation.
depends_on: [BS-002]
unblocks: []
acceptance_criteria:
  - The deterministic discovery algorithm has one canonical anchor.
  - Duplicate heading text does not produce ambiguous references.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual heading/anchor review
risk_class: binary_locator_anchor_ambiguity
reasoning_tier: low
context_scope: binary_locator_doc_structure
implementation_surfaces: [Plans/BinaryLocator_Spec.md]
node_compile_hint: {mode: structural_heading_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0039
preserved_exact_tokens: ["Deterministic discovery algorithm"]
negative_constraints:
  - Do not change binary discovery precedence as part of heading repair.
owner_hints: [Plans/BinaryLocator_Spec.md]
```
