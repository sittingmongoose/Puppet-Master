# Shard 028: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/MiscPlan.md`

Source lines: L6305-L6340

Source SHA256: `beb6fc1a5577ad84a061ff2803887816b569a9d4415ab37005d1ad0f9ef72ab0`

---

## Ledger Compile Addendum - pldg-20260614-001

### M-082 - References Status And Section 9.1.20 Recovery

```yaml
plan_unit_id: M-082
unit_type: constraint
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: >-
  MiscPlan duplicate References and Implementation status sections plus missing Section 9.1.20 are structural cleanup issues. Recovery should
  deduplicate repeated section bodies, preserve source-lineage for moved text, and restore or explicitly disposition the missing 9.1.20 anchor
  without changing product behavior.
gui_related: false
gui_classification_reason: MiscPlan section cleanup is documentation structure, not GUI presentation.
depends_on: [M-001]
unblocks: []
acceptance_criteria:
  - Duplicate References and Implementation status sections have one canonical live location each.
  - Section 9.1.20 resolves or is explicitly marked non-applicable/source-lineage.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual heading/anchor review
risk_class: misc_doc_structure_drift
reasoning_tier: low
context_scope: misc_plan_doc_structure
implementation_surfaces: [Plans/MiscPlan.md]
node_compile_hint: {mode: structural_heading_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0041
preserved_exact_tokens: ["References", "Implementation status", "§9.1.20"]
negative_constraints:
  - Do not change product behavior while deduplicating structural sections.
owner_hints: [Plans/MiscPlan.md]
```
