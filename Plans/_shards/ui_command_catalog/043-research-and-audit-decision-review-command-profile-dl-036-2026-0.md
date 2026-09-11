# Shard 043: Research and Audit Decision Review Command Profile — DL-036 (2026-09-09)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L12936-L13026

Source SHA256: `e4c23ee572a4c6025140e570dc9f0837a474d3ce1e7952c8f9414f2838ce59d1`

---

## Research and Audit Decision Review Command Profile — DL-036 (2026-09-09)

DL-036 reuses the six lifecycle IDs already owned by Assistant Chat section 7.4. They are documented here as `candidate_not_registered` until actual command and native-handler admission: their presence in questionnaire prose does not prove dispatcher implementation. Exact explained exclusions in `Plans/Wiring_Matrix.production.exclusions.json` represent that current inventory state and must be removed atomically with real command/handler admission and production wiring. An unavailable candidate reports `command_not_registered`; a registered command whose handler is unavailable reports `handler_unavailable`. No production row or native handler is fabricated by this planning compile.

All six are direct `domain_action` commands with `normalization.kind = none`, `normalizes_to_contract = CV-328` plus the existing questionnaire lifecycle contract, and `alias_of_command_id = null`. Shared `UICommand` and `UICommandResponse`, permissions, currentness and idempotency remain authoritative. The profile introduces no parallel approve/deny command family.

| Existing command ID | Label | Owner operation | Preconditions |
|---|---|---|---|
| `cmd.questionnaire.draft_update` | Edit decision response draft | Update only the current choice and conditional user text; preserve unsubmitted draft state. | Current thread/questionnaire/packet/item revision and owning user flow. |
| `cmd.questionnaire.submit` | Send decision response | Explicitly submit one validated user response through the decision-review profile. | Exactly one of four choices; required change/question text when applicable; authenticated host user provenance and current pending item. |
| `cmd.questionnaire.dismiss` | Pause decision review | Preserve the current draft and pause the conversational branch without deciding or submitting. | Current questionnaire identity; no successful disposition implied. |
| `cmd.questionnaire.resume` | Resume decision review | Restore the same pending item, draft, inquiry or completed outcome from durable state. | Matching persisted thread/packet/item identity and current owner projection. |
| `cmd.questionnaire.expire` | Expire questionnaire round | Apply the existing questionnaire timeout to the round without changing the decision disposition. | Existing lifecycle deadline and authorized lifecycle owner; not a fifth card response. |
| `cmd.questionnaire.mark_unavailable` | Mark questionnaire unavailable | Record existing headless/HITL-unavailable lifecycle state without inventing a user answer. | Authorized lifecycle owner and explicit unavailable condition; not a fifth card response. |

`cmd.nav.open_subject` remains the sole existing document/artifact navigation command for opening the complete packet through its canonical `OpenSubject`/route contract. Its existing production-intent row is reused; this compile does not claim runtime handler availability. Opening, inspecting, copying a link to, or closing the artifact creates no questionnaire answer or decision disposition. The full packet stays openable before, during and after single-item presentation. Access failure remains explicit and cannot become an empty successful review.

Requests use the CV-328 `ResearchDecisionReviewRequest` profile around the existing `QuestionnaireEnvelope`, retaining exact thread, packet/revision, decision item/revision and questionnaire/round identities. A successful explicit user submission produces the host-derived `ResearchDecisionUserResponse` projection with `decision_response = approve | deny | deny_with_changes | ask_question`; it does not overwrite the locked questionnaire `response_kind` or `QuestionAnswer.source` enums. Only authenticated host user action may produce that decision response; an agent/tool caller or client-asserted respondent field is insufficient. No option is preselected as a submitted answer.

The visible choice is exactly Approve, Deny, Deny with changes or Ask a question. Deny with changes requires the user's exact nonblank change text; Ask a question requires the user's exact nonblank question. Their conditional text controls belong to the same logical card and introduce no fifth response. Invalid or incomplete submission has no disposition effect. Draft edits never submit. Dismissal, navigation, timeout, unavailable state and dispatch acceptance never approve, deny or consume the item.

Submission of an Ask a question round may complete that questionnaire round, but the decision remains pending. The owning top-level agent routes the inquiry to research or answers it through the existing authorized flow, records the answer on the same item and re-presents it; it does not advance to the next decision or mint a replacement decision from the answer. Delivery retries and replay of an already committed response cannot duplicate an inquiry, disposition or planning amendment. Late responses with stale packet/item revision have no new effect; a retry of the same accepted request returns its existing result. Resume reads durable disposition/inquiry state before presenting anything, and terminally answered items are never re-asked under a new packet revision.

Decision persistence acknowledgement from SP-258 precedes advancement or downstream planning projection. Approve authorizes feature planning only; Deny excludes the proposal; Deny with changes preserves the exact amendment under PWIZ-027 without silently approving the changed proposal. PWIZ-010 Approve And Build remains a separate authority path. No decision response invokes execution. Lifecycle maintenance commands remain owner-internal and cannot appear as extra decision choices.

### UCC-161 — Research Decision Review

```yaml
plan_unit_id: UCC-161
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The DL-036 review profile reuses the six existing questionnaire lifecycle IDs and artifact OpenSubject
  navigation, with exact user-response semantics, current identity and truthful registration status. Four explicit
  responses feed durable planning dispositions without creating execution authority.
gui_related: true
gui_classification_reason: User-visible decision commands, response sequencing and truthful availability.
depends_on:
- ACD-459
- CV-328
- SP-258
- PWIZ-027
- UCC-158
unblocks: []
acceptance_criteria:
- All six listed lifecycle IDs have complete label, purpose, precondition, command_kind, normalization and owner
  metadata; no separate approve/deny action family or fifth card response exists.
- All six currently unregistered lifecycle IDs have exact explained candidate exclusions; remove each atomically
  with actual command/handler admission and production wiring. Existing artifact navigation receives no exclusion
  or duplicate row.
- The CV-328 wrapper and host-derived response preserve questionnaire enums, packet/item/round revisions and user-source
  authority. Agent-originated or stale submissions have no decision effect.
- Exactly one fixed response is explicitly submitted; required change/question text is validated, no selection
  default submits, and invalid or incomplete responses leave disposition unchanged.
- Ask a question keeps the decision pending, records its exact inquiry/answer and re-presents the same item; replay
  cannot duplicate inquiry, advance the item or reopen an answered disposition.
- Dismissal, draft editing, expiry, unavailability and artifact navigation never submit or decide; resume restores
  durable pending or terminal state.
- Only durable disposition acknowledgement advances the item or projects an amendment. Approve remains planning-only
  and PWIZ-010 retains execution approval.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-plans-verify.py run-gates
- Future native decision-review fixtures for response, identity, replay, persistence and dismissal.
risk_class: decision_authority_or_disposition_loss
reasoning_tier: high
context_scope: research_audit_decision_review
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Contracts_V0.md
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
