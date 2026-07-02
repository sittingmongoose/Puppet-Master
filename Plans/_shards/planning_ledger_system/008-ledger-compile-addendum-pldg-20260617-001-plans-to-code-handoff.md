# Shard 008: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Planning_Ledger_System.md`

Source lines: L678-L735

Source SHA256: `68a80bd13ec1858d66affb4b3991f15defb0eafb5fd3ddca0adb557f901ccd63`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### PLS-013 - Implementation Readiness And Doc Impact Matrix Compile Inputs

```yaml
plan_unit_id: PLS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  A v2 planning ledger may declare implementation_readiness_matrix.json and doc_impact_matrix.json as required compile inputs when a ledger-to-Plans compile must produce implementation-ready PlanUnits and reference coverage. implementation_readiness_matrix maps design areas to required PlanUnits, schemas, fields, acceptance criteria, validators, owner docs, consumer docs, and no-build boundaries. doc_impact_matrix maps primary owner docs, direct consumer docs, reference/index/UI docs, search tokens, required update types, deferred update handling, and per-doc no-update evidence. The ledger remains source/planning memory; canonical truth is established only by live non-pipeline Plans docs and schema drafts after compile.
  The doc_impact_matrix rule forbids owner-only repairs: Do not update only the obvious owner docs while leaving stale references in consumer/index/UI docs.
gui_related: false
gui_classification_reason: Matrix input handling is ledger/process behavior, not GUI implementation.
depends_on: [PLS-010, PDS-015]
unblocks: []
acceptance_criteria:
  - Matrix refs in compact state are treated as required compile inputs when present.
  - Implementation readiness covers PlanUnits, schemas, fields, acceptance, validators, owner/consumer docs, and no-build boundaries.
  - Doc impact covers owner, consumer, reference/index/UI docs, search terms, required updates, no-update evidence, and deferred updates.
  - The ledger remains source memory rather than canonical product prose.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future bootstrap ledger validate matrix checks
risk_class: vague_compile_output
reasoning_tier: high
context_scope: bootstrap_ledger_compile_inputs
implementation_surfaces: [Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md]
node_compile_hint: {mode: compile_input_matrix_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0061
  - pldg-20260617-001-plans-to-code-handoff:atom-0062
  - pldg-20260617-001-plans-to-code-handoff:dec-0026
  - pldg-20260617-001-plans-to-code-handoff:corr-0010
preserved_exact_tokens:
  - "implementation_readiness_matrix"
  - "required PlanUnits"
  - "schemas"
  - "fields"
  - "acceptance criteria"
  - "validators"
  - "owner docs"
  - "consumer docs"
  - "no-build boundaries"
  - "doc_impact_matrix"
  - "reference docs"
  - "search tokens"
  - "no-update evidence"
  - "deferred rename"
negative_constraints:
  - Do not compile vague roadmap prose that leaves future agents to infer the contracts.
  - Do not update only obvious owner docs while leaving direct stale references unaccounted for.
owner_hints:
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md
