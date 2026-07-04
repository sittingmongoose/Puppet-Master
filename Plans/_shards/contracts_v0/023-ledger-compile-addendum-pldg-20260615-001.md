# Shard 023: Ledger Compile Addendum - pldg-20260615-001

Source: `Plans/Contracts_V0.md`

Source lines: L17150-L17231

Source SHA256: `62ac536232f2fe0947cc864c88fcd075628826b7e5ef05a81530c5b15169a232`

---

## Ledger Compile Addendum - pldg-20260615-001

### CV-285 - Intra-File Runtime Contract Precedence

```yaml
plan_unit_id: CV-285
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 runtime/event/action contract precedence is explicit: named canonical
  PlanUnits and contract sections for blocked payloads, scheduler events, action IDs,
  compatibility mirrors, and retired aliases govern earlier transitional tables or
  shorter enum lists in the same file. Implementers and doc-parsing gates must not
  infer precedence from chronological addendum order, and the external audit phrase
  `later addenda over early tables` is preserved only as a non-quote wording correction
  because that exact phrase was not found in Contracts_V0.md.
gui_related: false
gui_classification_reason: This unit defines runtime/event/action contract precedence rather than visual presentation.
depends_on:
  - CV-245
  - CV-246
  - CV-255
unblocks: []
acceptance_criteria:
  - Runtime/event/action readers can identify canonical blocked payload, event alias, action ID, and enum owners without relying on addendum order.
  - Earlier shorter enum or event tables are compatibility/source-lineage when later named PlanUnits define the canonical family.
  - The wording correction for `later addenda over early tables` is preserved and not misquoted as source text from Contracts_V0.md.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, or production build tasks are created; explicit governance/index/evidence refreshes are recorded in the repair/seal artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260615-001-part-4-fable-cleanup
risk_class: contracts_precedence_drift
reasoning_tier: high
context_scope: contracts_runtime_event_action_precedence
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: contracts_intra_file_runtime_contract_precedence
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0013
  - pldg-20260615-001-part-4-fable-cleanup:atom-0014
  - pldg-20260615-001-part-4-fable-cleanup:atom-0015
  - pldg-20260615-001-part-4-fable-cleanup:atom-0017
  - pldg-20260615-001-part-4-fable-cleanup:atom-0018
  - local:Plans/Contracts_V0.md:2280
  - local:Plans/Contracts_V0.md:2390
  - local:Plans/Contracts_V0.md:2393
preserved_exact_tokens:
  - "Canonical Runtime Taxonomy and Event Precedence Canonical Alignment (2026-03-09)"
  - "Canonical Runtime Event, Outcome, and Action Contract Canonical Alignment (2026-03-09)"
  - "later addenda over early tables"
  - "same-file"
  - "early table"
  - "compatibility mirror"
  - "No section in this file may present an earlier shorter enum set as the canonical value family"
  - "blocked_reason_code"
  - "allowed_action_ids[]"
  - "scheduler.pass"
  - "node.blocked"
  - "run.scheduler_analysis"
  - "run.node_blocked"
  - "run.node_unblocked"
  - "run.remediation_started"
  - "run.remediation_completed"
negative_constraints:
  - Do not preserve two independent canonical enum families in Contracts_V0.md.
  - Do not require implementers to infer canonicality from chronological addendum order.
  - Do not misquote external audit wording as exact Contracts_V0.md source text.
compatibility_only_notes:
  - "`later addenda over early tables` is preserved as external audit wording, not as a Contracts_V0.md quote."
  - Run_Modes, Models_System, and chain-wizard-flexibility remain consumer/existing-coverage surfaces for this cleanup; CV-285 owns only Contracts_V0 intra-file runtime/event/action precedence.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
```
