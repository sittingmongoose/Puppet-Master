# Shard 036: Research Decision Review Planned Wiring — DL-036 (2026-09-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L4426-L4504

Source SHA256: `1e174cdc574c82377e7dc79cace28a169998a26825b2aad68fea1ffc36d77c68`

---

## Research Decision Review Planned Wiring — DL-036 (2026-09-09)

These are owner/consumer planning obligations, with current runtime disposition explicit. The six questionnaire lifecycle commands documented by UCC-161 remain `candidate_not_registered` and have exact explained exclusions in the machine wiring inventory; this addendum creates no native handler or production row. Future admission removes the exact corresponding exclusion atomically with command/handler registration and complete production wiring. The existing artifact navigation production-intent row is reused without claiming its native implementation works.

| Surface / producer | Shared dispatch / owner | Typed effect and consumer | Required future verification |
|---|---|---|---|
| One current decision card: choice and conditional text | UCC-161 draft update / ACD-459 | CV-328 questionnaire profile draft only | No defaults, auto-submit or fifth response; reload preserves unsubmitted text. |
| Explicit four-response submission | UCC-161 submit / CV-328 and SP-258 | Host-derived user response; durable pending/approved/denied/denied_with_changes projection | Exact identity/revision, user source, required text, idempotent retry and storage-failure recovery; no unacknowledged advancement. |
| Ask a question round and research answer | Shared submit / top-level question owner | Same pending item and correlated inquiry/answer under ACD-459 | Questionnaire submission cannot consume decision; no duplicate research request on replay, no automatic next item. |
| Dismiss, resume, lifecycle expiry or unavailable state | Corresponding UCC-161 lifecycle command | Existing questionnaire outcome; SP-258 disposition unchanged | Same decision item and recorded round state restored; a fresh round follows CV-328. No fabricated decision or re-asking an answered item. |
| Open complete artifact before/during/after cards | Existing `cmd.nav.open_subject` and canonical `OpenSubject` | Complete packet read/navigation with no disposition mutation | Existing route/permission/currentness contract, explicit missing backing and no duplicate navigation registry row. |
| Persisted disposition → planning run | SP-258 → PWIZ-027 | Approved topics, excluded proposals, exact denied-with-changes amendments, pending inquiries | No silent approval of changed proposal; PWIZ-010 execution gate remains separate. |

Command receipts describe the actual dispatch/result; they are not user decisions or invented persisted event producers. Matching authoritative disposition state controls text statuses under F3-550. The fixture matrix covers duplicate delivery, stale packet/item revision, dismissal, interrupted research, late answer, reload, packet reorder/republication, persistence failure and unavailable artifact. General questionnaire multiple-item submission remains unchanged outside this specialized one-at-a-time decision profile.

### WM-053 — Research Decision Review

```yaml
plan_unit_id: WM-053
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: The DL-036 planning matrix maps shared questionnaire dispatch, same-item inquiry return, artifact
  navigation, durable dispositions and downstream planning, while retaining truthful candidate inventory and the
  separate build gate.
gui_related: true
gui_classification_reason: User-visible decision commands, response sequencing and truthful availability.
depends_on:
- UCC-161
- UIW-022
- CV-328
- SP-258
- PWIZ-027
- F3-550
unblocks: []
acceptance_criteria:
- All six table rows resolve to UCC-161, CV-328, SP-258, ACD-459, PWIZ-027 and F3-550 without a private answer
  store, new approve/deny command family or fabricated native producer.
- Six exact candidate exclusions match actual unregistered lifecycle IDs and are removed atomically on real admission;
  the existing artifact-open intent remains unexcluded.
- Native fixtures must prove required conditional text, authenticated user source, exact current identity, idempotent
  replay and durable acknowledgement before advancement.
- Ask/answer and lifecycle fixtures preserve the same pending decision; resume/republication restores terminal
  outcomes without re-asking.
- Full artifact access has no decision mutation and reports unavailable backing explicitly. Text status has no
  colored border bars/stripes or emoji glyphs.
- Dispositions feed planning topics/exclusions/exact amendments only; no command receipt, generic questionnaire
  submission or feature approval bypasses PWIZ-010.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-plans-verify.py run-gates
- Future native decision-review fixtures for response, identity, replay, persistence and dismissal.
risk_class: decision_authority_or_disposition_loss
reasoning_tier: high
context_scope: research_audit_decision_review
implementation_surfaces:
- Plans/Wiring_Matrix.md
- Plans/Wiring_Matrix.production.json
- Plans/Wiring_Matrix.production.exclusions.json
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
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
