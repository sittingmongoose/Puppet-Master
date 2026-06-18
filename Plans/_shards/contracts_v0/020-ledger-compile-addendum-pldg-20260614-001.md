# Shard 020: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/Contracts_V0.md`

Source lines: L16728-L16807

Source SHA256: `e93a5ae670cc2f4545ae3c7bdb377ced223d99f0af6bba79fb6055652ad1c0bc`

---

## Ledger Compile Addendum - pldg-20260614-001

### CV-279 - Concern And Approval Owner Section Recovery Compile Addendum

```yaml
plan_unit_id: CV-279
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns durable concern identity, concern lifecycle fields, route/open primitives, approval_scope_key, blocked episode
  identity, approver identity fields, and promotion-class contract boundaries. TODO-style owner sections such as Define concern_id/project_id/run
  and scope refs must compile into contract-level fields or explicit source-lineage dispositions; they must not remain imperative instructions
  masquerading as contract prose.
gui_related: false
gui_classification_reason: Contract record fields and lifecycle identity are backend/runtime contracts, not visual presentation.
depends_on: [CV-001, CV-003, CV-004, CV-005, CV-041, CV-043, CV-046, CV-072, CV-073]
unblocks: [OP-020]
acceptance_criteria:
  - Concern record family, concern lifecycle, approval scope, and approver identity language is contract-level, not TODO imperative prose.
  - Residual source-token bank material remains quarantined under CV-001 unless a source-backed field contract exists.
  - Route/open compatibility material maps to existing RouteTarget/OpenSubject contract primitives.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-001-part-2-cleanup-fable-audit
risk_class: contract_owner_drift
reasoning_tier: high
context_scope: contracts_owner_sections
implementation_surfaces: [Plans/Contracts_V0.md, Plans/Orchestrator_Page.md, Plans/storage-plan.md]
node_compile_hint: {mode: contract_owner_section_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0017
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0051
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0052
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0053
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0057
  - source_ref:Plans/Contracts_V0.md:1
  - source_ref:Plans/Contracts_V0.md:224
preserved_exact_tokens: ["source-token bank", "Contracts_V0-S0001", "CV-001", "CV-002 through CV-278", "Define concern_id/project_id/run and scope refs", "route_target", "OpenSubject", "approval_scope_key", "approver identity fields", "blocked_sequence"]
negative_constraints:
  - Do not infer implementation-ready contracts from S0001 token fragments without coherent source coverage.
  - Do not let Orchestrator_Page re-own contract primitives.
owner_hints: [Plans/Contracts_V0.md, Plans/Orchestrator_Page.md, Plans/storage-plan.md, Plans/human-in-the-loop.md]
```

### CV-280 - Concern Merge Split Supersession Deferred Authority

```yaml
plan_unit_id: CV-280
unit_type: deferred_decision
status: deferred
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Concern merge, split, and supersession remain discussion-only until concern identity, routing, authority, and history rules are
  promoted to contract-level field and event definitions. Orchestrator may display lineage and route to retained concern ids, but it
  must not invent executable merge/split/supersession mutation authority from GUI or run-graph prose alone.
gui_related: false
gui_classification_reason: The deferred authority is a contract/event mutation boundary, not GUI presentation.
depends_on: [CV-279, OP-020]
unblocks: []
acceptance_criteria:
  - Concern lineage terms active, acknowledged, resolved, dismissed, resolution_kind, accepted_risk, merged, split, and superseded are preserved as source-lineage until field/event contracts are complete.
  - Consumers may display and link lineage but cannot mutate concern history without a contract-level event definition.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual contract owner review before promotion
risk_class: deferred_contract_authority
reasoning_tier: high
context_scope: concern_lineage_contract
implementation_surfaces: [Plans/Contracts_V0.md, Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md]
node_compile_hint: {mode: deferred_contract_decision, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0054
  - source_ref:Plans/Run_Graph_View.md:36
preserved_exact_tokens: ["active", "acknowledged", "resolved", "dismissed", "resolution_kind", "accepted_risk", "merged", "split", "superseded", "discussion-only", "contract-level"]
negative_constraints:
  - Do not define executable merge/split/supersession behavior in consumer docs first.
  - Do not collapse dismissed or acknowledged into resolved.
owner_hints: [Plans/Contracts_V0.md, Plans/Run_Graph_View.md, Plans/Decision_Policy.md]
```
