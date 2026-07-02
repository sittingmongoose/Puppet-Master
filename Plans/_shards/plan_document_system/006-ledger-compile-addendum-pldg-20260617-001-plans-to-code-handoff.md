# Shard 006: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Plan_Document_System.md`

Source lines: L713-L786

Source SHA256: `32494db5e40e941b6270eb2091b6e2134bdff95c8edcb22b2c1c7cf7747c3ceb`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### PDS-015 - Owner Consumer Reference Scan Gate

```yaml
plan_unit_id: PDS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: >-
  Ledger-to-Plans compiles that change owner contracts must account for direct owner docs, consumer docs, and reference/index/UI/wiring docs. The compile records touched concepts, reference scan terms, updated docs, no-update evidence, and deferred evidence. The former broad Plan Wizard rename deferral is superseded by the 2026-06-18 PRD Builder and Planning Wizard owner map; new active content uses Planning Wizard terminology, while retained Plan Wizard and Chain Wizard tokens require explicit historical/source-lineage or compatibility disposition. Completion claims for such compiles must include a reference/backlink scan result or an audit artifact that proves every direct reference was updated, intentionally unchanged, or explicitly deferred. Post-compile audit/index closure validates the updated Plans, repairs exact-detail drift before indexing, regenerates only Plans/.plan_index after Plans are stable, reports governance_status, and runs governance seal only when explicitly asked.
  Post-compile repair must validate the PlanUnit index inputs, do not run PlanCompile, preserve backlinks, index docs, UI command docs, wiring, and crosswalks, and honor: Do not update only the obvious owner docs while leaving stale references in consumer/index/UI docs. It also preserves: Do not do an uncontrolled whole-repo rename as part of this compile; do not leave direct contradictions in touched sections.
gui_related: false
gui_classification_reason: Reference scan gates and compile closure evidence are plan-document governance behavior.
depends_on: [PDS-014]
unblocks: []
acceptance_criteria:
  - Owner, consumer, reference/index/UI, and wiring docs are accounted for after owner contract edits.
  - Direct references are updated, intentionally unchanged with evidence, or explicitly deferred.
  - Active owner and consumer prose uses Planning Wizard after the 2026-06-18 owner map; retained Plan Wizard or Chain Wizard tokens are historical/source-lineage or compatibility-only.
  - Post-compile closure validates Plans first, repairs exact-detail drift before index generation, regenerates only Plans/.plan_index, and does not seal governance without an explicit request.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future owner_routing_findings.jsonl audit
risk_class: stale_reference_drift
reasoning_tier: high
context_scope: ledger_to_plans_reference_scan
implementation_surfaces: [Plans/Plan_Document_System.md, Plans/Planning_Ledger_System.md, Plans/00-plans-index.md]
node_compile_hint: {mode: owner_consumer_reference_scan_gate, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0059
  - pldg-20260617-001-plans-to-code-handoff:atom-0062
  - pldg-20260617-001-plans-to-code-handoff:atom-0063
  - pldg-20260617-001-plans-to-code-handoff:atom-0064
  - pldg-20260617-001-plans-to-code-handoff:dec-0027
  - pldg-20260617-001-plans-to-code-handoff:dec-0028
  - pldg-20260617-001-plans-to-code-handoff:corr-0010
preserved_exact_tokens:
  - "reference/backlink scan"
  - "touched concepts"
  - "direct references"
  - "backlinks"
  - "index docs"
  - "UI command docs"
  - "wiring"
  - "crosswalks"
  - "no-update evidence"
  - "deferred rename"
  - "owner prose"
  - "consumer docs"
  - "reference/index/UI docs"
  - "directly reference"
  - "broad Plan Wizard rename remains deferred"
  - "Planning Wizard"
  - "post-compile audit/index"
  - "repairs exact-detail drift"
  - "Plans/.plan_index"
  - "governance_status"
negative_constraints:
  - Do not claim ledger-to-Plans compile complete until reference scan results are recorded.
  - Do not do an uncontrolled whole-repo rename as part of this compile.
  - Do not leave direct contradictions in touched sections.
  - Do not run governance seal unless explicitly asked.
compatibility_only_notes:
  - Pre-rename Plan Wizard and Chain Wizard tokens may remain in source_lineage, preserved_exact_tokens, historical migration notes, and compatibility aliases only.
stale_retired_dispositions:
  - The old Plan Wizard redesign deferred framing is superseded by the 2026-06-18 PRD Builder and Planning Wizard owner map.
owner_hints:
  - Plans/Plan_Document_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/00-plans-index.md
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/00-plans-index.md
