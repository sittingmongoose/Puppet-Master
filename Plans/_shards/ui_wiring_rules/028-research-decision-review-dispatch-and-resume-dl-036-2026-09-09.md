# Shard 028: Research Decision Review Dispatch and Resume — DL-036 (2026-09-09)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1594-L1701

Source SHA256: `f67ecdcee1e1368527206db111e9bc9fd32b139dd2b8ee1036da9cfbd31d8e4a`

---

## Research Decision Review Dispatch and Resume — DL-036 (2026-09-09)

The UCC-161 lifecycle command profile is the sole dispatch route for the ACD-459 decision-review card. Choice selection and its conditional text remain PM-managed draft updates until explicit user submission. The dispatcher routes the existing questionnaire commands using CV-328, not a card-private response store or new approval route. The six handlerless lifecycle candidates use exact explained temporary exclusions until real admission; production certification requires their removal together with the actual registered command, handler, typed result and wiring evidence. No active command exemption or wildcard is introduced.

A matching typed response and SP-258 durable acknowledgement control displayed disposition and sequencing. UI response arrival, tool output, toast, accepted dispatch or generic questionnaire submitted state cannot decide the research item. Host-derived user provenance, expected packet/item revision and idempotent request identity must agree before mutation. A replay of a committed request returns the existing result; conflicting or stale payloads do not modify the decision, inquiry or amendment. A storage failure leaves the same item recoverable and cannot advance or advertise durable approval.

Ask a question submits only the inquiry round: the item stays pending, the top-level owning agent routes research and returns the answer to that same item, and only that item is re-presented. Pending drafts, inquiry/answer correlation and all terminal dispositions survive resume. Reordered or republished artifacts do not re-ask terminally answered items. Dismiss, expiry, unavailable state and navigation remain questionnaire lifecycle outcomes with no fabricated decision. General questionnaire batch semantics remain unchanged.

Opening the complete packet always reuses the canonical artifact `OpenSubject` route through `cmd.nav.open_subject`, independently of the current card; it has no disposition effect. The four decision response labels and conditional text controls do not introduce extra lifecycle buttons as fifth choices. Visible statuses consume persisted text projections under F3-550; no colored status border bars or stripes and no emoji glyphs. PWIZ-027 consumes planning dispositions, and PWIZ-010 remains the separate Approve And Build gate.

### UIW-022 — Research Decision Review

```yaml
plan_unit_id: UIW-022
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Research decision-review wiring routes shared questionnaire commands through the CV-328 profile
  and advances only on matching durable disposition; inquiry rounds and lifecycle outcomes never fabricate a decision.
gui_related: true
gui_classification_reason: User-visible decision commands, response sequencing and truthful availability.
depends_on:
- UIW-019
- UCC-161
- ACD-459
- CV-328
- SP-258
- PWIZ-027
- F3-550
unblocks: []
acceptance_criteria:
- Every entry point uses UCC-161 with exact thread/packet/item/round identity, host user provenance, currentness
  and shared idempotency. No private widget mutation or agent answer bypass exists.
- Four user responses and conditional required text map exactly to CV-328; invalid, stale and conflicting submissions
  have no disposition effect.
- Generic questionnaire submitted state does not imply a terminal decision; Ask a question remains pending until
  user disposition, with one correlated inquiry and same-item answer round trip.
- Disposition persistence failure, replay, dismiss, resume, timeout, unavailability, reorder and republish fixtures
  preserve the same recoverable state and never re-ask answered items.
- Full artifact navigation remains openable with no decision mutation. Stored status is text only, without colored
  status border bars/stripes or emoji glyphs.
- Exactly the six candidate lifecycle exclusions follow UCC-161 removal-on-admission; no handlerless production
  rows or active navigation exemptions exist.
- Planning disposition does not dispatch execution; PWIZ-010 is still required.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-plans-verify.py run-gates
- Future native decision-review fixtures for response, identity, replay, persistence and dismissal.
risk_class: decision_authority_or_disposition_loss
reasoning_tier: high
context_scope: research_audit_decision_review
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/Wiring_Matrix.production.json
- Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-036
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/records/design_atoms.jsonl:atom-0005
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/source_shards/decision_authority_20260909.md
negative_constraints:
- No auto-submit, auto-approval or auto-denial on dismissal, expiry or navigation.
- No agent-originated answer or client-declared user identity as decision authority.
- No fifth response, new approve/deny command family or rewrite of general questionnaire enums.
- No duplicate inquiry, disposition or amendment on replay; no re-asking an answered item.
- No execution approval, runtime implementation, WorkNodes, NodeSeeds or fabricated production wiring.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-036, ContractName:Plans/assistant-chat-design.md#ACD-459, ContractName:Plans/Contracts_V0.md#CV-328, ContractName:Plans/storage-plan.md#SP-258, ContractName:Plans/Planning_Wizard.md#PWIZ-027, ContractName:Plans/FinalGUISpec.md#F3-550, ContractName:Plans/UI_Command_Catalog.md#UCC-161, ContractName:Plans/UI_Wiring_Rules.md#UIW-022, ContractName:Plans/Wiring_Matrix.md#WM-053


### UIW-023 - Response Projection Wiring And Truthful Proof Boundaries

```yaml
plan_unit_id: UIW-023
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: "Every production command control consumes the central response projection while its typed owner result remains separate. UI acknowledgement, receipt-shaped fixtures and declared schema references are not native handler or effect proof."
gui_related: true
gui_classification_reason: This governs visible command feedback and control wiring.
depends_on: [CV-331, UCC-162]
unblocks: []
acceptance_criteria:
  - "Use one production-root response_contract_ref and preserve each command row's owner request/result refs, normalization, state selector, disabled reasons, permissions and effect contract."
  - "Render accepted/pending, verified terminal result and recovery-required distinctly; replay cannot imply another side effect."
  - "Local actions do not invent owner-operation scope; pre-dispatch failures do not produce completion or domain events."
  - "Check both run-gates and audit-governance integration and reject schema, cross-record identity, receipt, replay and generation mismatches."
  - "Report declared global response coverage, explicit typed result refs and native proof separately; missing adapters or handlers remain unproven."
validation_surfaces: [Plans/ui_command_response_fixtures.json, tests/test_pm_ui_command_response.py, python3 scripts/pm-plans-verify.py validate-ui-command-response, python3 scripts/pm-plan-index.py validate]
risk_class: command_response_identity_or_false_completion
reasoning_tier: high
context_scope: central_command_response_bridge
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json, scripts/pm-plans-verify.py]
node_compile_hint: {mode: static_command_response_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [USER-PACKET-GAP-CLOSURE-20260910, Plans/Shared_Integration_Runtime.md#SIR-015]
negative_constraints:
  - No native dispatcher, owner authentication, effect execution, new command, event or physical storage-family admission is proved by static fixtures.
  - No second command outcome owner, fabricated operation scope, automatic retry of unknown effects, or governance/readiness lift.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-331, ContractName:Plans/ui_command_response.schema.json, ContractName:Plans/Shared_Integration_Runtime.md#SIR-015
